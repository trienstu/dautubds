import re
import uuid
import mimetypes
from datetime import datetime
from urllib.parse import quote, urlparse
import requests
from bs4 import BeautifulSoup, NavigableString, Tag

from config import (
    SANITY_PROJECT_ID,
    SANITY_DATASET,
    SANITY_API_VERSION,
    SANITY_API_TOKEN,
)

BASE_URL = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}"

def get_headers(content_type="application/json"):
    headers = {}
    if SANITY_API_TOKEN:
        headers["Authorization"] = f"Bearer {SANITY_API_TOKEN}"
    if content_type:
        headers["Content-Type"] = content_type
    return headers

def check_source_exists(source_url: str) -> bool:
    """Kiểm tra bài viết gốc đã tồn tại trong Sanity hay chưa qua trường sourceUrl."""
    if not source_url:
        return False
    
    # Query kiểm tra cả bản publish và draft
    query = f'count(*[_type == "post" && sourceUrl == "{source_url}"])'
    url = f"{BASE_URL}/data/query/{SANITY_DATASET}?query={quote(query)}"
    
    try:
        resp = requests.get(url, headers=get_headers(), timeout=10)
        if resp.status_code == 200:
            count = resp.json().get("result", 0)
            return count > 0
    except Exception as e:
        print(f"[WARN] Không thể kiểm tra sourceUrl trên Sanity: {e}")
    return False

def upload_image_asset(image_url: str, filename: str = None) -> str | None:
    """Tải ảnh từ URL ngoài và upload trực tiếp vào Sanity Asset Storage."""
    if not image_url or not image_url.startswith("http"):
        return None
    
    try:
        # Tải ảnh gốc
        img_resp = requests.get(
            image_url,
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"},
            timeout=15
        )
        if img_resp.status_code != 200 or len(img_resp.content) < 1000:
            return None
        
        content_type = img_resp.headers.get("Content-Type", "image/jpeg")
        if ";" in content_type:
            content_type = content_type.split(";")[0].strip()
            
        if not filename:
            path_name = urlparse(image_url).path.split("/")[-1]
            ext = mimetypes.guess_extension(content_type) or ".jpg"
            filename = path_name if "." in path_name else f"image-{uuid.uuid4().hex[:8]}{ext}"
            
        upload_url = f"{BASE_URL}/assets/images/{SANITY_DATASET}?filename={quote(filename)}"
        headers = get_headers(content_type=content_type)
        
        up_resp = requests.post(upload_url, headers=headers, data=img_resp.content, timeout=30)
        if up_resp.status_code in (200, 201):
            asset_doc = up_resp.json().get("document", {})
            return asset_doc.get("_id")
        else:
            print(f"[WARN] Sanity upload ảnh thất bại ({up_resp.status_code}): {up_resp.text}")
    except Exception as e:
        print(f"[WARN] Lỗi tải/upload ảnh {image_url}: {e}")
    return None

def create_slug(title: str) -> str:
    """Tạo slug không dấu chuẩn SEO từ tiêu đề tiếng Việt."""
    import unicodedata
    s = unicodedata.normalize('NFD', title)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('đ', 'd').replace('Đ', 'D')
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return f"{s[:80]}-{int(datetime.now().timestamp())}"

def html_to_portable_text(html_content: str, uploaded_images_map: dict = None) -> list[dict]:
    """Chuyển đổi mã HTML thành các khối PortableText tương thích schema Sanity của WEBSITE BDS."""
    if not uploaded_images_map:
        uploaded_images_map = {}
        
    soup = BeautifulSoup(html_content, "html.parser")
    blocks = []
    
    def make_span(text: str, marks: list = None) -> dict:
        return {
            "_type": "span",
            "_key": uuid.uuid4().hex[:12],
            "text": text,
            "marks": marks or []
        }

    for elem in soup.children:
        if isinstance(elem, NavigableString):
            text = elem.strip()
            if text:
                blocks.append({
                    "_type": "block",
                    "_key": uuid.uuid4().hex[:12],
                    "style": "normal",
                    "markDefs": [],
                    "children": [make_span(text)]
                })
            continue

        if not isinstance(elem, Tag):
            continue

        tag_name = elem.name.lower()
        
        # Heading 2, 3
        if tag_name in ["h2", "h3"]:
            blocks.append({
                "_type": "block",
                "_key": uuid.uuid4().hex[:12],
                "style": tag_name,
                "markDefs": [],
                "children": [make_span(elem.get_text().strip())]
            })
            
        # Blockquote
        elif tag_name == "blockquote":
            blocks.append({
                "_type": "block",
                "_key": uuid.uuid4().hex[:12],
                "style": "blockquote",
                "markDefs": [],
                "children": [make_span(elem.get_text().strip())]
            })
            
        # Lists (ul, ol)
        elif tag_name in ["ul", "ol"]:
            list_item_type = "bullet" if tag_name == "ul" else "number"
            for li in elem.find_all("li", recursive=False):
                blocks.append({
                    "_type": "block",
                    "_key": uuid.uuid4().hex[:12],
                    "style": "normal",
                    "listItem": list_item_type,
                    "level": 1,
                    "markDefs": [],
                    "children": [make_span(li.get_text().strip())]
                })
                
        # Image tag
        elif tag_name == "img":
            src = elem.get("src", "")
            alt = elem.get("alt", "")
            asset_id = uploaded_images_map.get(src)
            if asset_id:
                blocks.append({
                    "_type": "image",
                    "_key": uuid.uuid4().hex[:12],
                    "asset": {"_type": "reference", "_ref": asset_id},
                    "alt": alt
                })
                
        # Paragraph or generic container
        else:
            # Check for embedded images inside paragraph
            imgs = elem.find_all("img")
            if imgs:
                for img in imgs:
                    src = img.get("src", "")
                    alt = img.get("alt", "")
                    asset_id = uploaded_images_map.get(src)
                    if asset_id:
                        blocks.append({
                            "_type": "image",
                            "_key": uuid.uuid4().hex[:12],
                            "asset": {"_type": "reference", "_ref": asset_id},
                            "alt": alt
                        })
                    img.decompose()
                    
            text = elem.get_text().strip()
            if text:
                blocks.append({
                    "_type": "block",
                    "_key": uuid.uuid4().hex[:12],
                    "style": "normal",
                    "markDefs": [],
                    "children": [make_span(text)]
                })

    return blocks

def create_post_document(
    title: str,
    excerpt: str,
    html_content: str,
    source_url: str,
    thumbnail_asset_id: str = None,
    uploaded_images_map: dict = None,
    seo_title: str = None,
    seo_description: str = None,
    is_market_analysis: bool = False,
    is_draft: bool = True
) -> dict:
    """Tạo tài liệu bài viết trong Sanity CMS."""
    slug_str = create_slug(title)
    doc_id = f"drafts.ai-{int(datetime.now().timestamp())}" if is_draft else f"post-{slug_str}"
    
    # Chuyển HTML thành PortableText
    blocks = html_to_portable_text(html_content, uploaded_images_map)
    
    # Bổ sung link tham khảo nguồn gốc ở cuối bài chuẩn E-E-A-T
    if source_url:
        blocks.append({
            "_type": "block",
            "_key": uuid.uuid4().hex[:12],
            "style": "blockquote",
            "markDefs": [],
            "children": [{
                "_type": "span",
                "_key": uuid.uuid4().hex[:12],
                "text": f"Nguồn tổng hợp & tham khảo: {source_url}",
                "marks": ["em"]
            }]
        })
        
    doc = {
        "_type": "post",
        "_id": doc_id,
        "title": title,
        "slug": {
            "_type": "slug",
            "current": slug_str
        },
        "sourceUrl": source_url,
        "isMarketAnalysis": is_market_analysis,
        "excerpt": excerpt,
        "content": blocks,
        "date": datetime.now().isoformat(),
        "seo": {
            "_type": "seo",
            "seoTitle": seo_title or title,
            "seoDescription": seo_description or excerpt
        }
    }
    
    if thumbnail_asset_id:
        doc["imageUrl"] = {
            "_type": "image",
            "asset": {
                "_type": "reference",
                "_ref": thumbnail_asset_id
            }
        }
        
    # Gửi mutation lên Sanity
    mutate_url = f"{BASE_URL}/data/mutate/{SANITY_DATASET}"
    payload = {
        "mutations": [
            {"createOrReplace": doc}
        ]
    }
    
    resp = requests.post(mutate_url, headers=get_headers(), json=payload, timeout=20)
    if resp.status_code == 200:
        return {
            "success": True,
            "document_id": doc_id,
            "title": title,
            "slug": slug_str,
            "status": "draft" if is_draft else "published"
        }
    else:
        raise Exception(f"Lỗi Sanity Mutation ({resp.status_code}): {resp.text}")
