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
    Áp dụng bộ quy chuẩn Noti Content Skill & Anti-Workflow-Ultimate:
    1. viet-content-seo-geo-v5: Chuẩn hóa SEO on-page, AEO (Direct Answer 40-50 từ), GEO (AI Search trích dẫn).
    2. Real Estate NLP & Psychology: Đánh trúng nỗi đau (tiến độ, pháp lý, sổ hồng, lãi suất thả nổi, chi phí cơ hội).
    3. Humanizer: Khử sạch toàn bộ giọng điệu bot AI, viết như nhà báo kinh tế / chuyên gia BĐS kỳ cựu.
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
Bạn là Chuyên gia phân tích thị trường Bất Động Sản cao cấp kiêm Tổng biên tập kỳ cựu của chuyên trang đầu tư BĐS.
Nhiệm vụ của bạn là đọc thông tin bài báo BĐS dưới đây và VIẾT LẠI THÀNH MỘT BÀI BÁO PHÂN TÍCH HOÀN TOÀN MỚI (Unique 100%), đạt điểm tuyệt đối về SEO, AEO, GEO, Tâm lý học đầu tư BĐS và Giọng văn chuyên gia thực chiến.

==================================================
CHỦ ĐỀ & THÔNG TIN BÀI VIẾT GỐC:
- Tiêu đề gốc: {article_title}
- Link bài viết: {source_url}

NỘI DUNG CHI TIẾT BÀI BÁO GỐC:
{clean_text}

==================================================
BỘ QUY CHUẨN NỘI DUNG BẤT ĐỘNG SẢN CHUYÊN SÂU (NOTI CONTENT SKILL):
1. BÁM SÁT 100% SỰ KIỆN & SỐ LIỆU GỐC:
   - Bài gốc viết về sự kiện/dự án/chính sách gì thì bài viết mới phải tập trung đúng trọng tâm đó.
   - TUYỆT ĐỐI KHÔNG tự ý đổi chủ đề, giữ chuẩn dòng thời gian cập nhật của thị trường hiện tại.

2. ĐÁNH TRÚNG TÂM LÝ & NỖI ĐAU THẬT CỦA NHÀ ĐẦU TƯ / NGƯỜI MUA NHÀ:
   - Nỗi sợ mua dự án chậm tiến độ, chủ đầu tư thiếu hụt dòng tiền, dự án đắp chiếu.
   - Nỗi sợ pháp lý chưa hoàn chỉnh, chậm cấp sổ hồng riêng, tranh chấp quỹ bảo trì.
   - Áp lực lãi suất vay thả nổi sau thời gian ưu đãi và bài toán chi phí cơ hội của dòng tiền.
   - Nỗi sợ mua đỉnh khi thị trường chưa định hình rõ chu kỳ phục hồi.

3. TỪ VỰNG THỰC CHIẾN CỦA GIỚI ĐẦU TƯ:
   - Sử dụng linh hoạt, tự nhiên: "sổ hồng riêng", "thanh khoản", "BĐS dòng tiền", "tỷ suất cho thuê", "vị trí đắc địa", "tiềm năng tăng giá", "hạ tầng kết nối", "quy hoạch 1/500", "ân hạn nợ gốc", "biên độ lợi nhuận".

4. ĐÒN BẨY TÂM LÝ NLP & THUYẾT PHỤC:
   - Authority (Uy tín): Luôn có số liệu thực, trích dẫn văn bản quy hoạch, hạ tầng liên vùng hoặc tiến độ thực tế.
   - Cost of Inaction (Chi phí trì hoãn): Phân tích chi phí cơ hội khi chần chừ bỏ lỡ các đợt mở bán đầu hoặc khi hạ tầng sắp thông xe.
   - Anchoring (Neo giá): So sánh mặt bằng giá với các dự án/khu vực lân cận để độc giả thấy rõ giá trị thực và dư địa tăng trưởng.

5. TIÊU CHUẨN VIET-CONTENT-SEO-GEO-V5:
   - Tiêu đề (title): Dạng Sentence case (CHỈ viết hoa chữ cái đầu câu và tên riêng/thương hiệu, TUYỆT ĐỐI không viết hoa từng chữ Title Case kiểu tiếng Anh).
   - Thẻ Heading: Sử dụng <h2> và <h3> dạng Sentence case, chia mạch nội dung theo mô hình kim tự tháp ngược.
   - Đoạn văn: Ngắn gọn từ 2-4 câu, phân tách bằng khoảng trắng thoáng, tối ưu trải nghiệm đọc trên smartphone.
   - AEO (Answer Engine Optimization): Ngay dưới H2 đầu tiên, phải có 1 đoạn Direct Answer (40-50 từ) trả lời thẳng vào vấn đề để Google trích xuất Featured Snippet.
   - GEO (Generative Engine Optimization): Nêu rõ các thực thể (Tên dự án, vị trí, chủ đầu tư, mức giá, quy mô) để các AI (ChatGPT, Perplexity, Gemini) dễ dàng trích dẫn nguồn.
   - Dữ liệu trực quan: Nếu bài có số liệu so sánh, hãy dùng bảng HTML <table> hoặc danh sách <ul><li> để trình bày khoa học.

6. TIÊU CHUẨN HUMANIZER - KHỬ TUYỆT ĐỐI MÙI VĂN AI:
   - CẤM các cấu trúc bot sáo rỗng:
     ❌ "Không chỉ... mà còn..."
     ❌ "Đóng vai trò quan trọng", "Bức tranh toàn cảnh", "Bước tiến vượt bậc", "Hứa hẹn sẽ là"
     ❌ "Hãy cùng chúng tôi khám phá", "Trong bối cảnh hiện nay", "Tóm lại là", "Lời kết"
   - Giọng văn đanh thép, gãy gọn, giàu tính thông tin và góc nhìn thực tế của người trong nghề BĐS.

{images_prompt}

==================================================
YÊU CẦU ĐẦU RA BẮT BUỘC (Chỉ trả về định dạng JSON hợp lệ, không bọc markdown ```json, không thêm bất kỳ lời dẫn nào):
{{
  "title": "Tiêu đề bài viết mới (Sentence case, giật tít chuyên gia phân tích, chứa từ khóa chính)",
  "excerpt": "Đoạn tóm tắt bài viết (Meta Description) dưới 160 ký tự, hấp dẫn, chứa từ khóa chính",
  "content_html": "Toàn bộ bài viết định dạng HTML sạch (dùng thẻ <h2>, <h3>, <p>, <ul>, <li>, <table>, <blockquote>, <img> nếu có ảnh). Thẻ heading cũng viết hoa Sentence case.",
  "seo_title": "Tiêu đề SEO tối ưu cho Google (dưới 65 ký tự)",
  "seo_description": "Mô tả SEO dưới 160 ký tự",
  "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3", "từ khóa 4"],
  "thumbnail_url": "URL của 1 ảnh đại diện đẹp nhất lấy từ danh sách ảnh khả dụng (nếu không có để rỗng)",
  "is_market_analysis": true hoặc false (chọn true nếu là bài phân tích xu hướng thị trường vĩ mô/chính sách, false nếu là bài tin tức dự án cụ thể)
}}
"""

    response = client.models.generate_content(
        model='gemini-3.5-flash-lite',
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
