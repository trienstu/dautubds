import json
import re
import uuid
from typing import Dict, Any, List, Tuple
from bs4 import BeautifulSoup
from google import genai
from google.genai import types

from config import GEMINI_API_KEY, SITE_BASE_URL
from engine import crawl_url_sync, extract_clean_article
from sanity_client import (
    upload_image_asset,
    html_to_portable_text,
    create_project_document,
    patch_project_document,
    get_project_by_slug_or_id,
    create_slug
)
from notifier import send_project_alert


def normalize_status(val: str) -> str:
    """Đảm bảo status luôn chỉ là 1 trong 3 lựa chọn của Sanity Studio: Đang mở bán, Sắp ra mắt, Đã bàn giao."""
    s = (val or "").strip().lower()
    if "bàn giao" in s:
        return "Đã bàn giao"
    if any(k in s for k in ["sắp", "chuẩn bị", "kick-off", "ra mắt", "booking", "rumo"]):
        return "Sắp ra mắt"
    return "Đang mở bán"

def normalize_price(val: str) -> str:
    """Đảm bảo mức giá chỉ là khoảng ngắn gọn (ví dụ: 1.7 - 5.56 tỷ hoặc 50 - 60 triệu/m²)."""
    if not val:
        return ""
    val = val.strip()
    if len(val) > 40:
        match = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:-|đến|–)\s*(\d+(?:[.,]\d+)?\s*(?:tỷ|triệu(?:/m[²2])?))", val, re.IGNORECASE)
        if match:
            return f"{match.group(1)} - {match.group(2)}"
    return val

def crawl_multiple_urls(urls: List[str]) -> Dict[str, Any]:
    """Cào đồng thời từ 1-5 đường dẫn bài viết tham khảo về dự án."""
    sources = []
    combined_texts = []
    all_images = []
    seen_img_urls = set()

    print(f"🕸️  Bắt đầu cào dữ liệu từ {len(urls)} link tham khảo...")
    for idx, url in enumerate(urls, 1):
        url = url.strip()
        if not url:
            continue
        print(f"   [{idx}/{len(urls)}] Đang cào: {url}")
        try:
            art = crawl_url_sync(url)
            sources.append(art)
            
            # Gom văn bản
            title = art.get("title", "")
            sapo = art.get("sapo", "")
            body = art.get("clean_text", "")
            combined_texts.append(
                f"--- NGUỒN {idx}: {url} ---\n"
                f"Tiêu đề: {title}\n"
                f"Sapo: {sapo}\n"
                f"Nội dung:\n{body}\n"
            )
            
            # Gom hình ảnh
            for img in art.get("images", []):
                src = img.get("src", "")
                if src and src.startswith("http") and src not in seen_img_urls:
                    seen_img_urls.add(src)
                    all_images.append(img)
                    
            print(f"      ✓ Thành công! Lấy được {len(body)} ký tự & {len(art.get('images', []))} ảnh.")
        except Exception as e:
            print(f"      ✗ Lỗi cào {url}: {e}")

    return {
        "sources": sources,
        "combined_text": "\n\n".join(combined_texts),
        "all_images": all_images
    }

def process_section_images_and_convert(html_content: str, image_cache: Dict[str, str]) -> List[Dict[str, Any]]:
    """Tải và upload toàn bộ ảnh trong đoạn HTML lên Sanity Assets rồi chuyển thành PortableText."""
    if not html_content:
        return []
        
    soup = BeautifulSoup(html_content, "html.parser")
    for img in soup.find_all("img"):
        src = img.get("src")
        if src and src.startswith("http") and src not in image_cache:
            print(f"   -> Đang upload ảnh nội dung: {src[:60]}...")
            asset_id = upload_image_asset(src)
            if asset_id:
                image_cache[src] = asset_id
                print(f"      ✓ Asset ID: {asset_id}")
                
    return html_to_portable_text(html_content, image_cache)


def generate_gemini_with_retry(client, prompt: str) -> str:
    """Gọi Gemini với cơ chế Exponential Backoff Retry và tự động chuyển model dự phòng khi gặp lỗi 503/429."""
    import time
    candidate_models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    last_err = None

    for model_name in candidate_models:
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2
                    )
                )
                if response.text:
                    return response.text
            except Exception as e:
                last_err = e
                err_str = str(e)
                if any(code in err_str for code in ["503", "429", "UNAVAILABLE", "RESOURCE_EXHAUSTED", "high demand"]):
                    wait_time = (2 ** attempt) * 2 + 1
                    print(f"   ⚠️ Model {model_name} quá tải tạm thời (503/429). Đang đợi {wait_time}s thử lại (lần {attempt+1}/3)...")
                    time.sleep(wait_time)
                else:
                    print(f"   [WARN] Model {model_name} trả lỗi không thử lại: {e}")
                    break

    raise Exception(f"Tất cả các model Gemini đều không khả dụng: {last_err}")

def synthesize_new_project_ai(crawled_data: Dict[str, Any], project_name_hint: str = "") -> Dict[str, Any]:
    """Sử dụng Gemini 2.5 Flash tổng hợp và viết dự án BĐS hoàn chỉnh theo chuẩn Anti-Workflow."""
    if not GEMINI_API_KEY:
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env.local")

    client = genai.Client(api_key=GEMINI_API_KEY)
    
    images_list = crawled_data.get("all_images", [])
    images_prompt = ""
    if images_list:
        imgs_formatted = "\n".join([f"- URL: {img['src']} | Chú thích: {img.get('alt', '')}" for img in images_list[:25]])
        images_prompt = f"""
DANH SÁCH HÌNH ẢNH GỐC THU THẬP ĐƯỢC TỪ CÁC NGUỒN:
{imgs_formatted}

YÊU CẦU PHÂN BỔ HÌNH ẢNH:
- Bạn BẮT BUỘC chọn ra 1 ảnh đẹp nhất làm `coverImageUrl` (ảnh bìa).
- Bạn BẮT BUỘC chọn ra 4-8 ảnh chất lượng cao nhất làm `galleryImageUrls` (thư viện slider).
- Trong các trường HTML (descriptionHtml, featuresHtml, locationHtml, pricingHtml, progressHtml), hãy chủ động chèn thẻ `<img src="URL_CHÍNH_XÁC" alt="Mô tả chuẩn SEO"/>` vào giữa các đoạn văn phù hợp.
- TUYỆT ĐỐI KHÔNG tự bịa URL ảnh không có trong danh sách trên!
"""
    else:
        images_prompt = "Không thu thập được ảnh nào từ bài gốc. coverImageUrl để rỗng, galleryImageUrls là mảng rỗng []."

    prompt = f"""
Bạn là Chuyên gia tư vấn đầu tư Bất Động Sản cao cấp kiêm Nhà báo phân tích kinh tế kỳ cựu.
Nhiệm vụ của bạn là tổng hợp toàn bộ dữ liệu từ các bài viết nguồn dưới đây và biên soạn thành MỘT BÀI DỰ ÁN BẤT ĐỘNG SẢN HOÀN CHỈNH, CHUYÊN NGHIỆP, 100% UNIQUE, ĐẠT CHUẨN SEO/AEO/GEO CAO NHẤT.

==================================================
DỮ LIỆU CÁC BÀI NGUỒN ĐÃ CÀO:
{crawled_data.get("combined_text", "")}

{images_prompt}

==================================================
TIÊU CHUẨN NỘI DUNG ANTI-WORKFLOW-ULTIMATE:
1. [TIÊU CHUẨN VIET-CONTENT-SEO-GEO-V5]:
   - Tiêu đề (title): Viết hoa Sentence case (Chỉ viết hoa chữ đầu câu và danh từ riêng).
   - Thẻ Heading: Giao diện web ĐÃ CÓ SẴN thẻ <h2> cho từng tab (Tổng quan, Vị trí, Tiện ích, Bảng giá, Pháp lý). Vì vậy bên trong các trường HTML TUYỆT ĐỐI KHÔNG DÙNG THẺ <h2> Ở ĐẦU! Chỉ dùng <h3> cho các tiêu đề nhánh phụ bên trong.
   - Thẻ AEO (Answer Engine): Dùng các danh sách <ul><li> cho các thông số chi tiết (giá bán, diện tích, quy mô, mốc thời gian bàn giao).
   - GEO (Generative Engine Optimization): Trích dẫn đầy đủ các thực thể địa lý, pháp lý (Quy hoạch 1/500, giấy phép xây dựng), chủ đầu tư, ngân hàng bảo lãnh.

2. [TIÊU CHUẨN HUMANIZER - KHỬ MÙI BOT AI]:
   - TUYỆT ĐỐI CẤM các mẫu câu sáo rỗng: "Không chỉ... mà còn...", "Đóng vai trò quan trọng", "Bức tranh toàn cảnh", "Bước tiến vượt bậc", "Hứa hẹn sẽ là", "Hãy cùng chúng tôi khám phá".
   - Văn phong khách quan, sắc sảo, số liệu thực chứng, phân tích dưới góc nhìn nhà đầu tư thông thái.

==================================================
YÊU CẦU ĐẦU RA (Chỉ trả về JSON hợp lệ, không bọc markdown ```json, không thêm text ngoài):
{{
  "title": "Tên thương mại chính thức của dự án (Sentence case)",
  "category": "Căn hộ",
  "price": "BẮT BUỘC CHỈ GHI KHOẢNG GIÁ NGẮN GỌN TỪ THẤP NHẤT ĐẾN CAO NHẤT (ví dụ: 1.7 - 5.56 tỷ hoặc 50 - 60 triệu/m²). TUYỆT ĐỐI KHÔNG viết thành câu văn dài.",
  "productCount": "Tổng số lượng sản phẩm (ví dụ: 1.250 căn hộ)",
  "status": "BẮT BUỘC CHỈ CHỌN 1 TRONG 3 GIÁ TRỊ: Đang mở bán, Sắp ra mắt, hoặc Đã bàn giao. Tuyệt đối không thêm từ ngữ khác.",
  "location": "Vị trí địa lý hành chính cụ thể của dự án",
  "progressPercentage": 45,
  "excerpt": "Tóm tắt dự án dưới 160 ký tự cho Google Meta Description",
  "descriptionHtml": "Nội dung tổng quan dự án dạng HTML sạch (dùng <p>, <h3>, <ul>, <li>, <img>). Không dùng <h2> ở đầu.",
  "featuresList": ["Hồ bơi vô cực", "Công viên cảnh quan ven sông", "Phòng gym hiện đại"],
  "featuresHtml": "Nội dung chi tiết hệ thống tiện ích dạng HTML sạch (kèm ảnh <img> tiện ích nếu có).",
  "locationHtml": "Nội dung phân tích vị trí và tiềm năng hạ tầng dạng HTML sạch (kèm ảnh <img> sơ đồ vị trí nếu có).",
  "pricingHtml": "Bảng giá dự kiến và chính sách thanh toán dạng HTML sạch.",
  "legalHtml": "Thông tin pháp lý minh bạch của dự án dạng HTML sạch.",
  "investmentReasonsHtml": "4-5 lý do then chốt vì sao nên sở hữu/đầu tư dự án này dạng HTML sạch.",
  "progressHtml": "Thông tin tiến độ thi công cập nhật mới nhất dạng HTML sạch.",
  "faqs": [
    {{"question": "Dự án nằm ở đâu và ai là chủ đầu tư?", "answer": "Câu trả lời chi tiết."}},
    {{"question": "Mức giá bán hiện tại là bao nhiêu?", "answer": "Câu trả lời chi tiết."}}
  ],
  "coverImageUrl": "1 URL ảnh đẹp nhất làm ảnh bìa",
  "galleryImageUrls": ["URL 1", "URL 2", "URL 3", "URL 4"],
  "seoTitle": "Tiêu đề SEO dưới 65 ký tự",
  "seoDescription": "Mô tả SEO dưới 160 ký tự"
}}
"""

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2
        )
    )

    text = response.text or "{}"
    text_clean = re.sub(r"^```json\s*", "", text.strip())
    text_clean = re.sub(r"\s*```$", "", text_clean).strip()
    
    try:
        return json.loads(text_clean)
    except Exception as e:
        raise Exception(f"Không thể parse JSON từ Gemini: {e}\nRaw: {text[:500]}")

def merge_existing_project_ai(old_project: Dict[str, Any], crawled_data: Dict[str, Any]) -> Dict[str, Any]:
    """Smart Merge: Hợp nhất thông minh dự án cũ với thông tin/ảnh tiến độ mới cào được."""
    if not GEMINI_API_KEY:
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env.local")

    client = genai.Client(api_key=GEMINI_API_KEY)
    
    old_summary = {
        "title": old_project.get("title"),
        "category": old_project.get("category"),
        "price": old_project.get("price"),
        "status": old_project.get("status"),
        "location": old_project.get("location"),
        "productCount": old_project.get("productCount"),
        "progressPercentage": old_project.get("progressPercentage"),
        "features": old_project.get("features", [])
    }
    
    images_list = crawled_data.get("all_images", [])
    images_prompt = ""
    if images_list:
        imgs_formatted = "\n".join([f"- URL: {img['src']} | Chú thích: {img.get('alt', '')}" for img in images_list[:25]])
        images_prompt = f"""
DANH SÁCH ẢNH MỚI THU THẬP ĐƯỢC:
{imgs_formatted}

YÊU CẦU HÌNH ẢNH TIẾN ĐỘ:
- Bạn BẮT BUỘC chọn ra 2-4 ảnh thực tế công trường/tiến độ thi công hoặc sự kiện mới nhất để đưa vào mảng `newGalleryImageUrls` nhằm bổ sung vào bộ sưu tập ảnh hiện tại.
- Trong bài viết tiến độ mới `progressHtml`, hãy chèn thẻ `<img src="URL" alt="..."/>` thể hiện rõ hình ảnh công trường thực tế.
"""
    else:
        images_prompt = "Không có ảnh mới. newGalleryImageUrls để là mảng rỗng []."

    prompt = f"""
Bạn là Chuyên gia thẩm định & Cập nhật dữ liệu Bất Động Sản.
Website của chúng tôi đã có sẵn bài viết về dự án dưới đây. Hiện tại chúng tôi vừa thu thập được các bài báo mới cập nhật về TIẾN ĐỘ THI CÔNG, BẢNG GIÁ MỚI HOẶC CHÍNH SÁCH MỚI của dự án này.

Nhiệm vụ của bạn là: HỢP NHẤT THÔNG MINH (SMART MERGE) để làm mới bài viết dự án, cập nhật số liệu mới nhất mà vẫn bảo toàn tính nhất quán.

==================================================
1. THÔNG TIN DỰ ÁN HIỆN CÓ TRÊN HỆ THỐNG:
{json.dumps(old_summary, ensure_ascii=False, indent=2)}

2. DỮ LIỆU MỚI VỪA CÀO ĐƯỢC:
{crawled_data.get("combined_text", "")}

{images_prompt}

==================================================
QUY TẮC HỢP NHẤT THÔNG MINH (SMART MERGE):
1. GIỮ NGUYÊN BẤT BIẾN:
   - Tên thương mại dự án (`title`), Vị trí địa lý (`location`), Phân loại (`category`), Quy mô tổng sản phẩm (`productCount`).
2. CẬP NHẬT BIẾN ĐỘNG THEO NGUỒN MỚI:
   - `price`: Cập nhật giá mới nhất nếu nguồn mới có thông tin điều chỉnh giá hoặc chính sách đợt mới. Nếu không đổi, giữ nguyên giá cũ.
   - `status`: Cập nhật trạng thái (Đang mở bán, Sắp cất nóc, Đang hoàn thiện, Đã bàn giao).
   - `progressPercentage`: Cập nhật phần trăm tiến độ tương ứng (ví dụ: thi công móng 15-20%, cất nóc 70%, hoàn thiện nội thất 90%, bàn giao 100%).
   - `progressHtml`: Viết bài cập nhật tiến độ thi công mới nhất dạng HTML sạch (dùng <h3>, <p>, <ul>, <li>, chèn thẻ <img> thực tế công trường).
   - `pricingHtml`: Bổ sung hoặc làm mới bảng giá & CSBH mới nếu nguồn mới có dữ liệu.
   - `featuresList`: Giữ nguyên danh sách cũ và bổ sung thêm các tiện ích mới nếu có.
   - `updateNote`: Viết 1 đoạn tóm tắt ngắn gọn (2-3 câu) về những điểm mới được cập nhật (ví dụ: "Cập nhật tiến độ thi công cất nóc tháp A, bảng giá đợt 2 và bổ sung 3 ảnh thực tế công trường").

==================================================
YÊU CẦU ĐẦU RA (Chỉ trả về JSON hợp lệ, không bọc markdown ```json, không thêm text ngoài):
{{
  "title": "{old_project.get('title')}",
  "price": "BẮT BUỘC CHỈ GHI KHOẢNG GIÁ NGẮN GỌN TỪ THẤP NHẤT ĐẾN CAO NHẤT (ví dụ: 1.7 - 5.56 tỷ). TUYỆT ĐỐI KHÔNG viết thành câu văn dài.",
  "status": "BẮT BUỘC CHỈ CHỌN 1 TRONG 3 GIÁ TRỊ: Đang mở bán, Sắp ra mắt, hoặc Đã bàn giao.",
  "progressPercentage": 75,
  "progressHtml": "Bài viết tiến độ thi công cập nhật mới nhất dạng HTML sạch (chèn ảnh thực tế <img>)",
  "pricingHtml": "Bảng giá / CSBH cập nhật mới dạng HTML sạch (để null nếu không có thay đổi)",
  "featuresList": ["Danh sách tiện ích đầy đủ sau khi gộp"],
  "newGalleryImageUrls": ["URL ảnh thực tế công trường 1", "URL ảnh thực tế công trường 2"],
  "updateNote": "Tóm tắt những thay đổi vừa cập nhật",
  "seoDescription": "Mô tả SEO mới phản ánh tiến độ hiện tại"
}}
"""

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2
        )
    )

    text = response.text or "{}"
    text_clean = re.sub(r"^```json\s*", "", text.strip())
    text_clean = re.sub(r"\s*```$", "", text_clean).strip()
    
    try:
        return json.loads(text_clean)
    except Exception as e:
        raise Exception(f"Không thể parse JSON Smart Merge từ Gemini: {e}\nRaw: {text[:500]}")

def build_and_publish_new_project(
    urls: List[str],
    is_draft: bool = False,
    custom_title: str = None
) -> Dict[str, Any]:
    """Quy trình tạo dự án mới hoàn chỉnh từ 1-5 link nguồn."""
    print("\n=======================================================")
    print(f"🏢 BẮT ĐẦU TẠO DỰ ÁN BĐS TỪ {len(urls)} LINK NGUỒN")
    print("=======================================================")
    
    # 1. Cào đa nguồn
    crawled_data = crawl_multiple_urls(urls)
    if not crawled_data["sources"]:
        raise Exception("Không cào được nội dung từ bất kỳ link nào.")
        
    # 2. Tổng hợp bằng AI Engine
    print("\n✍️  Đang phân tích & tổng hợp bài viết dự án qua Anti-Workflow LLM Engine...")
    ai_project = synthesize_new_project_ai(crawled_data, project_name_hint=custom_title or "")
    if custom_title:
        ai_project["title"] = custom_title
        
    print(f"   ✓ Đã tạo bài dự án: \"{ai_project['title']}\"")
    print(f"   ✓ Phân loại: {ai_project.get('category')} | Giá: {ai_project.get('price')} | Tiến độ: {ai_project.get('progressPercentage')}%")
    
    # 3. Upload ảnh nội dung & chuyển đổi PortableText
    print("\n🖼️  Đang tải và upload ảnh nội dung vào Sanity Asset Storage...")
    image_cache = {}
    
    desc_blocks = process_section_images_and_convert(ai_project.get("descriptionHtml", ""), image_cache)
    loc_blocks = process_section_images_and_convert(ai_project.get("locationHtml", ""), image_cache)
    feat_blocks = process_section_images_and_convert(ai_project.get("featuresHtml", ""), image_cache)
    price_blocks = process_section_images_and_convert(ai_project.get("pricingHtml", ""), image_cache)
    legal_blocks = process_section_images_and_convert(ai_project.get("legalHtml", ""), image_cache)
    invest_blocks = process_section_images_and_convert(ai_project.get("investmentReasonsHtml", ""), image_cache)
    prog_blocks = process_section_images_and_convert(ai_project.get("progressHtml", ""), image_cache)
    
    # 4. Upload ảnh bìa (Cover Image) & Gallery
    cover_image_obj = None
    cover_url = ai_project.get("coverImageUrl")
    if cover_url and cover_url.startswith("http"):
        asset_id = image_cache.get(cover_url) or upload_image_asset(cover_url)
        if asset_id:
            cover_image_obj = {
                "_type": "image",
                "asset": {"_type": "reference", "_ref": asset_id}
            }
            
    # Gallery
    gallery_objs = []
    gallery_urls = ai_project.get("galleryImageUrls", [])
    print(f"   -> Đang upload {len(gallery_urls)} ảnh cho bộ sưu tập Gallery...")
    for g_url in gallery_urls:
        if g_url and g_url.startswith("http"):
            asset_id = image_cache.get(g_url) or upload_image_asset(g_url)
            if asset_id:
                gallery_objs.append({
                    "_type": "image",
                    "_key": uuid.uuid4().hex[:12],
                    "asset": {"_type": "reference", "_ref": asset_id}
                })
                
    # Nếu chưa có cover image nhưng gallery có ảnh thì lấy ảnh đầu của gallery
    if not cover_image_obj and gallery_objs:
        cover_image_obj = gallery_objs[0]

    floor_blocks = process_section_images_and_convert(ai_project.get("floorPlanHtml", ""), image_cache)
    show_blocks = process_section_images_and_convert(ai_project.get("showroomHtml", ""), image_cache)
    design_blocks = process_section_images_and_convert(ai_project.get("designHtml", ""), image_cache)

    # Format FAQs
    formatted_faqs = []
    for faq in ai_project.get("faqs", []):
        if isinstance(faq, dict) and faq.get("question") and faq.get("answer"):
            formatted_faqs.append({
                "_type": "object",
                "_key": uuid.uuid4().hex[:12],
                "question": faq["question"],
                "answer": faq["answer"]
            })
            
    # Chuẩn bị payload Sanity
    slug_str = create_slug(ai_project["title"])
    project_payload = {
        "title": ai_project["title"],
        "slug": slug_str,
        "category": ai_project.get("category", "Căn hộ"),
        "price": normalize_price(ai_project.get("price", "")),
        "productCount": ai_project.get("productCount", ""),
        "status": normalize_status(ai_project.get("status", "Đang mở bán")),
        "location": ai_project.get("location", ""),
        "progressPercentage": ai_project.get("progressPercentage"),
        "description": desc_blocks,
        "locationContent": loc_blocks,
        "features": ai_project.get("featuresList", []),
        "featuresContent": feat_blocks,
        "pricingContent": price_blocks,
        "legalContent": legal_blocks,
        "investmentReasons": invest_blocks,
        "progressContent": prog_blocks,
        "floorPlanContent": floor_blocks,
        "showroomContent": show_blocks,
        "designContent": design_blocks,
        "faqs": formatted_faqs,
        "imageUrl": cover_image_obj,
        "gallery": gallery_objs,
        "seo": {
            "_type": "seo",
            "seoTitle": ai_project.get("seoTitle") or ai_project["title"],
            "seoDescription": ai_project.get("seoDescription") or ai_project.get("excerpt", "")
        }
    }
    
    # 5. Lưu lên Sanity CMS
    mode_str = "Bản nháp (Draft)" if is_draft else "Xuất bản trực tiếp (Published)"
    print(f"\n💾 Đang lưu dự án vào Sanity CMS ({mode_str})...")
    res = create_project_document(project_payload, is_draft=is_draft)
    
    # 6. Gửi thông báo Telegram
    send_project_alert(
        title=res["title"],
        doc_id=res["document_id"],
        slug=res["slug"],
        is_update=False,
        status=mode_str,
        sources=urls
    )
    
    print(f"\n🎉 TẠO DỰ ÁN BĐS THÀNH CÔNG!")
    print(f"   - Document ID: {res['document_id']}")
    print(f"   - Tên dự án: {res['title']}")
    print(f"   - Slug: {res['slug']}")
    print(f"   - Link xem trên Web: {SITE_BASE_URL}/du-an/{res['slug']}")
    print(f"   - Link Sanity Studio: {SITE_BASE_URL}/admin/structure/project;{res['document_id']}")
    
    return res

def update_and_patch_project(
    slug_or_id: str,
    urls: List[str]
) -> Dict[str, Any]:
    """Smart Merge: Cập nhật dự án cũ với các link bài báo mới mà vẫn giữ nguyên 100% ID và Slug."""
    print("\n=======================================================")
    print(f"🔄 BẮT ĐẦU SMART MERGE CẬP NHẬT DỰ ÁN: {slug_or_id}")
    print("=======================================================")
    
    # 1. Lấy dữ liệu dự án cũ từ Sanity
    print(f"📥 Đang tải thông tin dự án hiện có từ Sanity...")
    old_project = get_project_by_slug_or_id(slug_or_id)
    if not old_project:
        raise Exception(f"Không tìm thấy dự án với mã/slug '{slug_or_id}' trên Sanity CMS.")
        
    doc_id = old_project["_id"]
    current_slug = old_project.get("slug", {}).get("current", slug_or_id)
    print(f"   ✓ Tìm thấy dự án: \"{old_project.get('title')}\" (ID: {doc_id})")
    print(f"   ✓ Slug hiện tại: {current_slug} (Sẽ được giữ nguyên 100%)")
    
    # 2. Cào các link mới
    crawled_data = crawl_multiple_urls(urls)
    if not crawled_data["sources"]:
        raise Exception("Không cào được nội dung từ bất kỳ link mới nào.")
        
    # 3. AI Smart Merge
    print("\n🧠 Đang chạy thuật toán Smart Merge qua Anti-Workflow LLM Engine...")
    merge_result = merge_existing_project_ai(old_project, crawled_data)
    print(f"   ✓ Smart Merge hoàn tất!")
    print(f"   ✓ Nhật ký cập nhật: {merge_result.get('updateNote')}")
    print(f"   ✓ Tiến độ mới: {merge_result.get('progressPercentage')}% | Trạng thái: {merge_result.get('status')}")
    
    # 4. Upload ảnh mới & chuyển đổi PortableText
    image_cache = {}
    patch_fields = {}
    
    if merge_result.get("price"):
        patch_fields["price"] = normalize_price(merge_result["price"])
    if merge_result.get("status"):
        patch_fields["status"] = normalize_status(merge_result["status"])
    if merge_result.get("location"):
        patch_fields["location"] = merge_result["location"]
    if merge_result.get("progressPercentage") is not None:
        try:
            patch_fields["progressPercentage"] = int(merge_result["progressPercentage"])
        except (ValueError, TypeError):
            pass
            
    if merge_result.get("progressHtml"):
        print("   -> Đang xử lý bài viết tiến độ thi công mới...")
        prog_blocks = process_section_images_and_convert(merge_result["progressHtml"], image_cache)
        if prog_blocks:
            patch_fields["progressContent"] = prog_blocks
            
    if merge_result.get("pricingHtml"):
        print("   -> Đang cập nhật bảng giá & chính sách bán hàng mới...")
        price_blocks = process_section_images_and_convert(merge_result["pricingHtml"], image_cache)
        if price_blocks:
            patch_fields["pricingContent"] = price_blocks
            
    if merge_result.get("featuresList"):
        patch_fields["features"] = merge_result["featuresList"]

    if merge_result.get("locationHtml"):
        print("   -> Đang cập nhật bài viết vị trí mới...")
        loc_b = process_section_images_and_convert(merge_result["locationHtml"], image_cache)
        if loc_b:
            patch_fields["locationContent"] = loc_b

    if merge_result.get("featuresHtml"):
        print("   -> Đang cập nhật bài viết tiện ích mới...")
        feat_b = process_section_images_and_convert(merge_result["featuresHtml"], image_cache)
        if feat_b:
            patch_fields["featuresContent"] = feat_b

    if merge_result.get("floorPlanHtml"):
        print("   -> Đang cập nhật mặt bằng mới...")
        floor_b = process_section_images_and_convert(merge_result["floorPlanHtml"], image_cache)
        if floor_b:
            patch_fields["floorPlanContent"] = floor_b

    if merge_result.get("showroomHtml"):
        print("   -> Đang cập nhật nhà mẫu mới...")
        show_b = process_section_images_and_convert(merge_result["showroomHtml"], image_cache)
        if show_b:
            patch_fields["showroomContent"] = show_b
        
    new_gallery_urls = merge_result.get("newGalleryImageUrls", [])
    if new_gallery_urls:
        print(f"   -> Đang upload và bổ sung {len(new_gallery_urls)} ảnh thực tế vào Gallery...")
        existing_gallery = list(old_project.get("gallery") or [])
        added_count = 0
        for g_url in new_gallery_urls:
            if g_url and g_url.startswith("http"):
                asset_id = image_cache.get(g_url) or upload_image_asset(g_url)
                if asset_id:
                    existing_gallery.append({
                        "_type": "image",
                        "_key": uuid.uuid4().hex[:12],
                        "asset": {"_type": "reference", "_ref": asset_id}
                    })
                    added_count += 1
        if added_count > 0:
            patch_fields["gallery"] = existing_gallery
            print(f"      ✓ Đã ghép nối tiếp {added_count} ảnh mới vào Gallery (Tổng: {len(existing_gallery)} ảnh).")

    if merge_result.get("seoDescription"):
        current_seo = old_project.get("seo") or {"_type": "seo"}
        current_seo["seoDescription"] = merge_result["seoDescription"]
        patch_fields["seo"] = current_seo

    # Đảm bảo có ảnh bìa imageUrl nếu đang rỗng
    if not old_project.get("imageUrl"):
        current_gal = patch_fields.get("gallery") or old_project.get("gallery") or []
        if current_gal:
            patch_fields["imageUrl"] = {
                "_type": "image",
                "asset": current_gal[0]["asset"]
            }

    # 5. Gửi patch mutation lên Sanity
    print(f"\n💾 Đang gửi Patch Mutation lên Sanity cho bản ghi {doc_id}...")
    patch_res = patch_project_document(doc_id, patch_fields)
    
    # 6. Gửi thông báo Telegram
    send_project_alert(
        title=old_project.get("title", ""),
        doc_id=doc_id,
        slug=current_slug,
        is_update=True,
        update_note=merge_result.get("updateNote", ""),
        status="Đã cập nhật (Live)",
        sources=urls
    )
    
    print(f"\n🎉 CẬP NHẬT DỰ ÁN THÀNH CÔNG!")
    print(f"   - Document ID: {doc_id} (Giữ nguyên)")
    print(f"   - Slug: {current_slug} (Giữ nguyên)")
    print(f"   - Link xem trên Web: {SITE_BASE_URL}/du-an/{current_slug}")
    print(f"   - Link Sanity Studio: {SITE_BASE_URL}/admin/structure/project;{doc_id}")
    
    return {
        "success": True,
        "document_id": doc_id,
        "title": old_project.get("title"),
        "slug": current_slug,
        "update_note": merge_result.get("updateNote")
    }
