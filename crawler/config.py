import os
from pathlib import Path
from dotenv import load_dotenv

# Tự động nạp file .env.local từ thư mục gốc của WEBSITE BDS
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env.local"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)

# Cấu hình Sanity CMS
SANITY_PROJECT_ID = os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID", "bdvrj3dm")
SANITY_DATASET = os.getenv("NEXT_PUBLIC_SANITY_DATASET", "production")
SANITY_API_VERSION = os.getenv("NEXT_PUBLIC_SANITY_API_VERSION", "2024-06-07")
SANITY_API_TOKEN = os.getenv("SANITY_API_TOKEN")

# Cấu hình Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Cấu hình Domain Website
SITE_BASE_URL = os.getenv("NEXT_PUBLIC_SITE_URL", "https://www.dautubds.io.vn")

# Danh sách nguồn RSS báo chí BĐS uy tín tại Việt Nam
RSS_SOURCES = [
    {
        "name": "VnExpress Bất Động Sản",
        "url": "https://vnexpress.net/rss/bat-dong-san.rss",
        "category": "tin-tuc"
    },
    {
        "name": "CafeF Bất Động Sản",
        "url": "https://cafef.vn/bat-dong-san.rss",
        "category": "thi-truong"
    },
    {
        "name": "Tuổi Trẻ Địa Ốc",
        "url": "https://tuoitre.vn/rss/kinh-doanh/dia-oc.rss",
        "category": "tin-tuc"
    },
    {
        "name": "Thanh Niên BĐS",
        "url": "https://thanhnien.vn/rss/kinh-te/bat-dong-san.rss",
        "category": "tin-tuc"
    }
]
