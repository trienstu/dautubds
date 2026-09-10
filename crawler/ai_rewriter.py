import json
import re
from typing import Dict, Any, List
from google import genai
from google.genai import types

from config import GEMINI_API_KEY

def rewrite_real_estate_article(
    article_title: str,
    clean_text: str,
    available_images: List[Dict[str, str]] = None,
    source_url: str = ""
) -> Dict[str, Any]:
    """
    Áp dụng triết lý Anti-Workflow-Ultimate:
    1. viet-content-seo-geo-v5: Chuẩn hóa SEO on-page, AEO (Featured Snippets), GEO (AI Search trích dẫn).
    2. humanizer: Khử sạch toàn bộ giọng điệu bot AI, viết như nhà báo kinh tế / chuyên gia BĐS kỳ cựu.
    """
    if not GEMINI_API_KEY:
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env.local")
        
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    images_prompt = ""
    if available_images:
        images_list_str = "\n".join([f"- URL: {img['src']} | Chú thích: {img['alt']}" for img in available_images[:6]])
        images_prompt = f"""
DANH SÁCH HÌNH ẢNH GỐC KHẢ DỤNG:
{images_list_str}

YÊU CẦU VỀ HÌNH ẢNH:
- Bạn BẮT BUỘC phải chọn ít nhất 1 hình ảnh từ danh sách trên để đưa vào bài viết (dùng thẻ `<img src="URL_CHÍNH_XÁC" alt="Mô tả chuẩn SEO"/>`).
- Bạn BẮT BUỘC phải chọn 1 ảnh đẹp nhất làm `thumbnail_url`.
- TUYỆT ĐỐI KHÔNG tự bịa URL ảnh không có trong danh sách trên.
"""
    else:
        images_prompt = "Bài viết gốc không có hình ảnh. thumbnail_url để rỗng."

    prompt = f"""
Bạn là chuyên gia phân tích thị trường Bất Động Sản kiêm Tổng biên tập kỳ cựu.
Nhiệm vụ của bạn là đọc thông tin bài báo BĐS dưới đây và VIẾT LẠI THÀNH MỘT BÀI BÁO PHÂN TÍCH HOÀN TOÀN MỚI (Unique 100%), đạt tiêu chuẩn khắt khe nhất về SEO, AEO, GEO và Văn phong con người.

==================================================
CHỦ ĐỀ & THÔNG TIN BÀI VIẾT GỐC:
- Tiêu đề gốc: {article_title}
- Link bài viết: {source_url}

NỘI DUNG CHI TIẾT BÀI BÁO GỐC:
{clean_text}

==================================================
NGUYÊN TẮC BẤT DI BẤT DỊCH VỀ NỘI DUNG:
1. BÁM SÁT 100% VÀO SỰ KIỆN & CHỦ ĐỀ CHÍNH CỦA BÀI GỐC:
   - Bài gốc viết về sự kiện/dự án/chính sách gì thì bài viết mới phải tập trung đúng trọng tâm đó.
   - TUYỆT ĐỐI KHÔNG tự ý đổi chủ đề, không tự bịa bối cảnh của năm cũ (ví dụ 2024 hay 2023) trừ khi bài gốc đề cập tới các mốc lịch sử đó.
   - Nếu bài gốc đề cập thời gian hiện tại hoặc mới nhất, hãy giữ chuẩn dòng thời gian cập nhật.

2. [TIÊU CHUẨN VIET-CONTENT-SEO-GEO-V5]:
- SEO (On-page Top 1):
  + Tiêu đề (title): Viết hoa theo dạng Sentence case (CHỈ viết hoa chữ cái đầu câu và tên riêng/thương hiệu, TUYỆT ĐỐI không viết hoa từng chữ Title Case kiểu tiếng Anh).
  + Thẻ Heading: Sử dụng <h2> và <h3> rõ ràng, chia mạch nội dung logic hình kim tự tháp ngược.
  + Đoạn văn: Mỗi đoạn ngắn gọn từ 2-4 câu, dễ đọc trên di động.
- AEO (Answer Engine Optimization - Tối ưu trả lời nhanh):
  + Ngay sau mở bài hoặc dưới H2 đầu tiên, phải có 1 đoạn tóm lược trực diện (Direct Answer 40-50 từ) trả lời ngay câu hỏi trọng tâm của thị trường/dự án.
  + Dùng danh sách liệt kê <ul><li> cho các thông số: giá bán, tiến độ, diện tích, pháp lý hoặc các mốc thời gian quan trọng.
- GEO (Generative Engine Optimization - Để AI như ChatGPT, Gemini, Perplexity trích dẫn):
  + Giữ nguyên và làm nổi bật các thực thể (Entities): Tên dự án, vị trí địa lý chính xác, chủ đầu tư, đơn vị thi công, mức giá cụ thể, số liệu quy mô.
  + Đưa ra các góc nhìn phân tích thị trường khách quan, có chiều sâu, trích dẫn bối cảnh chính sách/quy hoạch.

3. [TIÊU CHUẨN HUMANIZER - KHỬ TUYỆT ĐỐI MÙI VĂN AI]:
- TUYỆT ĐỐI CẤM các cấu trúc sáo rỗng:
  ❌ "Không chỉ... mà còn..." (Not X but Y)
  ❌ "Đóng vai trò quan trọng", "Là bức tranh toàn cảnh", "Bước tiến vượt bậc", "Hứa hẹn sẽ là"
  ❌ "Hãy cùng tìm hiểu", "Trong bối cảnh hiện nay", "Tóm lại là", "Lời kết"
- Giọng văn: Đanh thép, gãy gọn, giàu tính thông tin và góc nhìn thực tế của người trong nghề BĐS. Đan xen câu ngắn và câu dài tự nhiên.

{images_prompt}

==================================================
YÊU CẦU ĐẦU RA BẮT BUỘC (Chỉ trả về định dạng JSON hợp lệ, không bọc markdown ```json, không thêm bất kỳ lời dẫn nào):
{{
  "title": "Tiêu đề bài viết mới (Sentence case, giật tít chuyên gia phân tích, chứa từ khóa chính)",
  "excerpt": "Đoạn tóm tắt bài viết (Meta Description) dưới 160 ký tự, hấp dẫn, chứa từ khóa chính",
  "content_html": "Toàn bộ bài viết định dạng HTML sạch (dùng thẻ <h2>, <h3>, <p>, <ul>, <li>, <blockquote>, <img> nếu có ảnh). Thẻ heading cũng viết hoa Sentence case.",
  "seo_title": "Tiêu đề SEO tối ưu cho Google (dưới 65 ký tự)",
  "seo_description": "Mô tả SEO dưới 160 ký tự",
  "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3", "từ khóa 4"],
  "thumbnail_url": "URL của 1 ảnh đại diện đẹp nhất lấy từ danh sách ảnh khả dụng (nếu không có để rỗng)",
  "is_market_analysis": true hoặc false (chọn true nếu là bài phân tích xu hướng thị trường vĩ mô/chính sách, false nếu là bài tin tức dự án cụ thể)
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
        raise Exception(f"Không thể parse JSON từ phản hồi của Gemini: {e}\nRaw text: {text[:500]}")
