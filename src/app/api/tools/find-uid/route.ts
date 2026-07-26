import { NextResponse } from 'next/server';

// Hàm bóc tách UID thủ công từ HTML (Fallback)
async function scrapeUidFromHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 0 }
    });
    const html = await response.text();

    // Tìm trong thẻ meta al:android:url (thường chứa fb://profile/12345 hoặc fb://page/12345)
    const metaMatch = html.match(/content="fb:\/\/(?:profile|page)\/(?:\\?id=)?(\d+)"/i);
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1];
    }

    // Tìm trong JSON data (userID)
    const userMatch = html.match(/"userID":"(\d+)"/i) || html.match(/"user_id":"(\d+)"/i);
    if (userMatch && userMatch[1]) {
      return userMatch[1];
    }
    
    // Tìm pageID
    const pageMatch = html.match(/"pageID":"(\d+)"/i) || html.match(/"page_id":"(\d+)"/i);
    if (pageMatch && pageMatch[1]) {
      return pageMatch[1];
    }

    return null;
  } catch (error) {
    console.error("Lỗi khi cào HTML FB:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { link } = await request.json();

    if (!link || !link.includes('facebook.com') && !link.includes('fb.com')) {
      return NextResponse.json({ success: false, message: 'Link không hợp lệ. Vui lòng nhập link Facebook.' }, { status: 400 });
    }

    // 0. Bóc tách nhanh từ URL (nếu có id sẵn)
    const urlMatch = link.match(/(?:id=|fbid=|uid=|\/profile\.php\?id=)(\d+)/i);
    if (urlMatch && urlMatch[1]) {
      return NextResponse.json({ success: true, id: urlMatch[1], source: 'url' });
    }

    // 1. Thử dùng API miễn phí (id.traodoisub.com)
    try {
      const apiUrl = `https://id.traodoisub.com/api.php?link=${encodeURIComponent(link)}`;
      const res = await fetch(apiUrl, { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        next: { revalidate: 0 } 
      });
      const text = await res.text();
      // Bỏ qua Cloudflare challenge nếu bị chặn
      if (!text.includes('Just a moment')) {
        const data = JSON.parse(text);
        if (data && data.success === 200 && data.id) {
          return NextResponse.json({ success: true, id: data.id, source: 'api' });
        }
      }
    } catch (apiError) {
      console.warn("API TDS lỗi hoặc không phản hồi");
    }

    // 2. Nếu API trên thất bại, dùng phương pháp cào HTML thủ công
    const scrapedId = await scrapeUidFromHtml(link);
    if (scrapedId) {
      return NextResponse.json({ success: true, id: scrapedId, source: 'scraper' });
    }

    // 3. Không tìm thấy
    return NextResponse.json({ 
      success: false, 
      message: 'Không thể trích xuất UID tự động từ link này. API miễn phí hiện đang bảo trì hoặc Facebook đã chặn truy cập ẩn danh đối với tài khoản này. Vui lòng dùng link Profile/ID thay vì username.' 
    }, { status: 404 });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Đã xảy ra lỗi máy chủ.' }, { status: 500 });
  }
}
