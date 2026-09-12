#!/usr/bin/env python3
"""
Anti-Workflow Real Estate Auto-Crawl & Publishing Engine.
Powered by Crawl4AI, Anti-Workflow-Ultimate (viet-content-seo-geo-v5 + humanizer) & Sanity CMS.
"""

import argparse
import sys
from typing import List, Dict, Any
from bs4 import BeautifulSoup
import feedparser

from config import RSS_SOURCES, SITE_BASE_URL
from sanity_client import (
    check_source_exists,
    upload_image_asset,
    create_post_document,
    list_recent_projects
)
from engine import crawl_url_sync
from ai_rewriter import rewrite_real_estate_article
from notifier import send_telegram_alert
from project_engine import build_and_publish_new_project, update_and_patch_project

def fetch_rss_entries(limit_per_source: int = 5) -> List[Dict[str, Any]]:
    """Quét các nguồn RSS và lọc ra các bài viết chưa từng được cào vào Sanity."""
    pending_items = []
    print("\n🔍 Đang quét các luồng RSS báo chí Bất Động Sản...")
    
    for source in RSS_SOURCES:
        source_name = source["name"]
        source_url = source["url"]
        try:
            feed = feedparser.parse(source_url)
            count_found = 0
            for entry in feed.entries[:limit_per_source]:
                link = entry.get("link", "").strip()
                title = entry.get("title", "").strip()
                if not link:
                    continue
                    
                # Kiểm tra trùng lặp trên Sanity
                exists = check_source_exists(link)
                if not exists:
                    pending_items.append({
                        "source": source_name,
                        "title": title,
                        "url": link,
                        "published": entry.get("published", "")
                    })
                    count_found += 1
            print(f"  ✓ {source_name}: Phát hiện {count_found} bài viết mới chưa cào.")
        except Exception as e:
            print(f"  ✗ {source_name}: Lỗi đọc RSS ({e})")
            
    return pending_items

def process_single_article(url: str, is_draft: bool = False, force: bool = False) -> Dict[str, Any]:
    """Quy trình xử lý hoàn chỉnh cho 1 bài viết (Mặc định: Xuất bản trực tiếp)."""
    print(f"\n=======================================================")
    print(f"🚀 Bắt đầu xử lý bài viết: {url}")
    print(f"=======================================================")
    
    # 1. Kiểm tra chống trùng bài
    if not force and check_source_exists(url):
        print(f"⚠️  Bài viết đã tồn tại trên Sanity CMS. Bỏ qua để tránh trùng lặp.")
        return {"status": "skipped", "reason": "already_exists"}
        
    # 2. Cào bài viết bằng Crawl4AI + Smart Extractor
    print("🕸️  [Bước 1/4] Đang cào dữ liệu qua Crawl4AI & Smart Extractor...")
    crawled_data = crawl_url_sync(url)
    print(f"   ✓ Cào thành công! Tiêu đề gốc: {crawled_data.get('title')}")
    print(f"   ✓ Độ dài bài báo gốc: {len(crawled_data.get('clean_text', ''))} ký tự.")
    print(f"   ✓ Tìm thấy {len(crawled_data.get('images', []))} hình ảnh thực tế trong bài.")
    
    # 3. Viết lại bài bằng AI Engine (viet-content-seo-geo-v5 + humanizer)
    print("✍️  [Bước 2/4] Đang tái cấu trúc nội dung qua Anti-Workflow LLM Engine...")
    ai_result = rewrite_real_estate_article(
        article_title=crawled_data["title"],
        clean_text=crawled_data["clean_text"],
        available_images=crawled_data["images"],
        source_url=url
    )
    print(f"   ✓ Viết bài mới thành công: \"{ai_result['title']}\"")
    print(f"   ✓ Thể loại: {'Phân tích thị trường' if ai_result.get('is_market_analysis') else 'Tin tức dự án'}")
    
    # 4. Upload hình ảnh vào Sanity Assets
    print("🖼️  [Bước 3/4] Đang tải và upload ảnh vào Sanity Assets...")
    uploaded_images_map = {}
    
    # Tìm các thẻ <img> trong content_html để upload
    soup = BeautifulSoup(ai_result["content_html"], "html.parser")
    content_imgs = soup.find_all("img")
    
    for img in content_imgs:
        src = img.get("src")
        if src and src.startswith("http") and src not in uploaded_images_map:
            print(f"   -> Đang upload ảnh nội dung: {src[:60]}...")
            asset_id = upload_image_asset(src)
            if asset_id:
                uploaded_images_map[src] = asset_id
                print(f"      ✓ Asset ID: {asset_id}")

    # Upload thumbnail
    thumbnail_asset_id = None
    thumb_url = ai_result.get("thumbnail_url")
    if thumb_url and thumb_url.startswith("http"):
        if thumb_url in uploaded_images_map:
            thumbnail_asset_id = uploaded_images_map[thumb_url]
        else:
            print(f"   -> Đang upload ảnh bìa (thumbnail)...")
            thumbnail_asset_id = upload_image_asset(thumb_url)
    elif crawled_data["images"]:
        # Fallback: Lấy ảnh đầu tiên của bài viết
        first_img = crawled_data["images"][0]["src"]
        if first_img in uploaded_images_map:
            thumbnail_asset_id = uploaded_images_map[first_img]
        else:
            print(f"   -> Fallback: Đang upload ảnh bìa đầu tiên...")
            thumbnail_asset_id = upload_image_asset(first_img)
        
    # 5. Lưu vào Sanity CMS (Mặc định: Xuất bản ngay)
    mode_str = "Bản nháp (Draft)" if is_draft else "Xuất bản trực tiếp (Published)"
    print(f"💾 [Bước 4/4] Đang lưu bài viết vào Sanity CMS ({mode_str})...")
    res = create_post_document(
        title=ai_result["title"],
        excerpt=ai_result["excerpt"],
        html_content=ai_result["content_html"],
        source_url=url,
        thumbnail_asset_id=thumbnail_asset_id,
        uploaded_images_map=uploaded_images_map,
        seo_title=ai_result.get("seo_title"),
        seo_description=ai_result.get("seo_description"),
        is_market_analysis=ai_result.get("is_market_analysis", False),
        is_draft=is_draft
    )
    
    # 6. Gửi thông báo Telegram
    send_telegram_alert(
        title=res["title"],
        doc_id=res["document_id"],
        slug=res["slug"],
        status=mode_str,
        source_url=url
    )
    
    print(f"\n🎉 HOÀN TẤT XỬ LÝ BÀI VIẾT!")
    print(f"   - Document ID: {res['document_id']}")
    print(f"   - Tiêu đề mới: {res['title']}")
    print(f"   - Slug: {res['slug']}")
    print(f"   - Trạng thái: {res['status']}")
    if not is_draft:
        print(f"   - Link xem trực tiếp: {SITE_BASE_URL}/tin-tuc/{res['slug']}")
    print(f"   - Link Sanity Studio: {SITE_BASE_URL}/admin/structure/post;{res['document_id']}")
    
    return res

def main():
    parser = argparse.ArgumentParser(description="Anti-Workflow Real Estate Crawler")
    parser.add_argument("--scan", action="store_true", help="Quét danh sách các bài viết mới từ RSS")
    parser.add_argument("--run-once", action="store_true", help="Cào và xử lý 1 bài viết mới nhất từ RSS")
    parser.add_argument("--auto", action="store_true", help="Tự động cào và xử lý hàng loạt theo số lượng")
    parser.add_argument("--limit", type=int, default=3, help="Số lượng bài viết tối đa khi chạy --auto (mặc định: 3)")
    parser.add_argument("--url", type=str, help="Cào đích danh một đường dẫn bài báo cụ thể")
    parser.add_argument("--create-project", nargs="+", metavar="URL", help="Tạo dự án mới từ 1-5 link bài viết tham khảo")
    parser.add_argument("--update-project", type=str, metavar="SLUG_OR_ID", help="Cập nhật (Smart Merge) dự án cũ trên Sanity theo slug hoặc ID")
    parser.add_argument("--urls", nargs="+", metavar="URL", help="Danh sách các link bài báo mới dùng để cập nhật dự án")
    parser.add_argument("--title", type=str, help="Tên dự án tùy chỉnh (tùy chọn)")
    parser.add_argument("--list-projects", action="store_true", help="Xem danh sách các dự án hiện có trên Sanity")
    parser.add_argument("--draft", action="store_true", help="Lưu dưới dạng bản nháp (Draft) thay vì xuất bản trực tiếp")
    parser.add_argument("--force", action="store_true", help="Bỏ qua kiểm tra trùng lặp để cào lại URL")
    
    args = parser.parse_args()
    is_draft = args.draft # Mặc định là False (Auto Publish trực tiếp)
    
    if args.list_projects:
        projects = list_recent_projects(limit=30)
        print(f"\n🏢 Danh sách {len(projects)} dự án gần nhất trên Sanity CMS:")
        for idx, p in enumerate(projects, 1):
            slug = p.get('slug') or 'chưa có slug'
            title = p.get('title') or 'Không tên'
            price = p.get('price') or 'Chưa cập nhật'
            status = p.get('status') or 'N/A'
            prog = f"{p.get('progressPercentage')}%" if p.get('progressPercentage') is not None else "N/A"
            print(f"  {idx:2d}. [{slug}] {title} | Giá: {price} | TT: {status} | Tiến độ: {prog}")
        return

    if args.create_project:
        urls = args.create_project
        build_and_publish_new_project(urls, is_draft=is_draft, custom_title=args.title)
        return

    if args.update_project:
        slug_or_id = args.update_project
        urls = args.urls
        if not urls:
            print("❌ Lỗi: Khi dùng --update-project, bạn cần truyền kèm --urls <url1> [url2...]")
            return
        update_and_patch_project(slug_or_id, urls)
        return

    if args.url:
        process_single_article(args.url, is_draft=is_draft, force=args.force)
        return

    if args.scan:
        pending = fetch_rss_entries(limit_per_source=5)
        print(f"\n📊 Tổng cộng có {len(pending)} bài viết mới sẵn sàng để cào:")
        for idx, item in enumerate(pending, 1):
            print(f"  {idx}. [{item['source']}] {item['title']}\n     URL: {item['url']}")
        return

    if args.run_once:
        pending = fetch_rss_entries(limit_per_source=3)
        if not pending:
            print("✨ Không có bài viết mới nào cần xử lý.")
            return
        target = pending[0]
        process_single_article(target["url"], is_draft=is_draft, force=args.force)
        return

    if args.auto:
        pending = fetch_rss_entries(limit_per_source=5)
        if not pending:
            print("✨ Không có bài viết mới nào cần xử lý.")
            return
        targets = pending[:args.limit]
        print(f"\n⚡ Bắt đầu tiến trình tự động cào {len(targets)} bài viết...")
        for idx, item in enumerate(targets, 1):
            print(f"\n>>> Đang xử lý bài {idx}/{len(targets)}: {item['title']}")
            try:
                process_single_article(item["url"], is_draft=is_draft, force=args.force)
            except Exception as e:
                print(f"❌ Lỗi khi xử lý {item['url']}: {e}")
        return

    parser.print_help()

if __name__ == "__main__":
    main()
