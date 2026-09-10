import os
import requests
from config import BASE_DIR, ENV_FILE, SITE_BASE_URL
from dotenv import load_dotenv

if ENV_FILE.exists():
    load_dotenv(ENV_FILE)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_telegram_alert(title: str, doc_id: str, slug: str = "", status: str = "Đã xuất bản (Published)", source_url: str = ""):
    """Gửi tin nhắn thông báo bài viết mới về Telegram bot."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
        
    is_live = "draft" not in status.lower() and "nháp" not in status.lower()
    studio_link = f"{SITE_BASE_URL}/admin/structure/post;{doc_id}"
    live_link = f"{SITE_BASE_URL}/tin-tuc/{slug}"
    
    header = "🚀 *BÀI VIẾT BĐS MỚI ĐÃ XUẤT BẢN TRỰC TIẾP*" if is_live else "📝 *BÀI VIẾT BĐS MỚI ĐÃ ĐƯỢC TẠO (BẢN NHÁP)*"
    links_section = (
        f"🌐 [Xem bài viết trực tiếp trên Web]({live_link})\n"
        f"⚙️ [Quản lý trong Sanity Studio]({studio_link})"
    ) if is_live else f"👉 [Bấm vào đây để duyệt bài trên Sanity Studio]({studio_link})"
    
    text = (
        f"{header}\n\n"
        f"📝 *Tiêu đề:* {title}\n"
        f"📌 *Trạng thái:* {status}\n"
        f"🔗 *Nguồn gốc:* {source_url}\n\n"
        f"{links_section}"
    )
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False
    }
    
    try:
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            print("   📲 Đã gửi thông báo Telegram thành công!")
        else:
            print(f"   [WARN] Gửi Telegram lỗi ({resp.status_code}): {resp.text}")
    except Exception as e:
        print(f"   [WARN] Không thể gửi thông báo Telegram: {e}")
