import asyncio
from typing import Dict, Any, List
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from bs4 import BeautifulSoup

def extract_clean_article(html: str, url: str) -> Dict[str, Any]:
    """
    Trích xuất chính xác vùng nội dung bài báo, loại bỏ toàn bộ thanh điều hướng,
    tin vắn, sidebar, quảng cáo và xử lý ảnh lazy-load (data-src).
    """
    soup = BeautifulSoup(html, "html.parser")
    
    # 1. Trích xuất tiêu đề chính H1
    h1 = soup.find("h1")
    title = h1.get_text().strip() if h1 else ""
    
    # 2. Trích xuất Sapo / Tóm tắt mở đầu
    sapo = ""
    sapo_elem = soup.select_one("p.description, .sapo, .detail-sapo, .lead, .summary, .article-summary")
    if sapo_elem:
        sapo = sapo_elem.get_text().strip()
        
    # 3. Tìm chính xác vùng chứa nội dung bài báo
    body_container = None
    candidate_selectors = [
        "article.fck_detail",           # VnExpress
        "#maincontent",                  # Vietnamnet
        ".maincontent",                  # Vietnamnet
        "#mainContent",                  # CafeF
        ".totalcontentdetail",           # CafeF / Kenh14
        ".detail-content",               # TuoiTre / ThanhNien / DanTri / VnEconomy
        ".content-detail",               # Vietnamnet
        ".content_detail",               # Generic News
        ".entry-content",                # WordPress
        "article"                        # HTML5 Semantic
    ]
    for sel in candidate_selectors:
        found = soup.select_one(sel)
        if found and len(found.get_text().strip()) > 200:
            body_container = found
            break
            
    if not body_container:
        body_container = soup.find("body") or soup

    # 4. Trích xuất danh sách đoạn văn bản sạch
    paragraphs = []
    if sapo:
        paragraphs.append(sapo)
        
    for elem in body_container.find_all(["p", "h2", "h3"]):
        text = elem.get_text().strip()
        text_lower = text.lower()
        
        # Bỏ qua các đoạn text rác, thông báo bản quyền, link đọc thêm
        skip_phrases = [
            "tin liên quan", "đọc thêm", "theo dõi trên", "bấm để xem",
            "nguồn:", "ảnh:", "video:", "bản quyền thuộc", "xem thêm",
            "bình luận", "chia sẻ bài viết"
        ]
        if text and not any(phrase in text_lower for phrase in skip_phrases):
            paragraphs.append(text)
            
    clean_article_text = "\n\n".join(paragraphs)
    
    # 5. Trích xuất hình ảnh thực sự nằm trong bài viết (giải quyết data-src lazy load)
    article_images: List[Dict[str, str]] = []
    seen_urls = set()
    
    for img in body_container.find_all("img"):
        src = (
            img.get("data-src") or
            img.get("data-original") or
            img.get("data-srcset") or
            img.get("src") or
            ""
        ).strip()
        
        if " " in src:
            src = src.split(" ")[0]
            
        if not src or src.startswith("data:") or src in seen_urls:
            continue
            
        src_lower = src.lower()
        skip_img_keywords = ["logo", "icon", "banner", "avatar", "advert", "ad-", "pixel", "tracker", "facebook", "zalo", "telegram", ".svg", ".gif"]
        if any(k in src_lower for k in skip_img_keywords):
            continue
            
        # Tìm chú thích ảnh (fig caption hoặc alt)
        alt = img.get("alt", "").strip()
        parent_fig = img.find_parent(["figure", "div"])
        if parent_fig:
            cap = parent_fig.find(["figcaption", "p", "div"], class_=lambda c: c and any(k in str(c).lower() for k in ["caption", "desc", "note"]))
            if cap:
                alt = cap.get_text().strip() or alt
                
        seen_urls.add(src)
        article_images.append({
            "src": src,
            "alt": alt
        })
        
        if len(article_images) >= 30:
            break
        
    return {
        "url": url,
        "title": title,
        "sapo": sapo,
        "clean_text": clean_article_text,
        "images": article_images
    }

async def crawl_article(url: str) -> Dict[str, Any]:
    """Cào trang bằng Crawl4AI kết hợp trích xuất nội dung thông minh."""
    run_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        page_timeout=35000,
        verbose=False
    )
    
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=run_config)
        
        if not result.success:
            raise Exception(f"Crawl4AI thất bại khi cào {url}: {result.error_message}")
            
        # Trích xuất nội dung bài báo chuẩn xác từ HTML
        article_info = extract_clean_article(result.html, url)
        
        # Nếu trích xuất tiêu đề từ H1 rỗng, fallback về metadata
        if not article_info["title"]:
            article_info["title"] = result.metadata.get("title") or ""
            
        return article_info

def crawl_url_sync(url: str) -> Dict[str, Any]:
    """Wrapper đồng bộ để chạy crawler."""
    return asyncio.run(crawl_article(url))
