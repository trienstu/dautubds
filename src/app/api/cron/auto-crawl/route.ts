import { NextResponse } from 'next/server';
import { client } from '../../../../../sanity/lib/client';

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    // 1. Verify Cron Secret (Security)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Bỏ qua check cron trong lúc test trên localhost nếu không có biến này
      if (process.env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const feeds = [
      'https://vnexpress.net/rss/bat-dong-san.rss',
      'https://cafef.vn/bat-dong-san.rss',
      'https://vneconomy.vn/dia-oc.rss',
      'https://znews.vn/bat-dong-san.rss'
    ];

    let allLinks: string[] = [];

    // 2. Fetch all feeds
    for (const feed of feeds) {
      try {
        const res = await fetch(feed, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } });
        if (!res.ok) continue;
        const text = await res.text();
        
        // Cực kỳ đơn giản: dùng regex để lấy các thẻ <link> thay vì thư viện XML cồng kềnh
        const linksMatch = text.match(/<link>(.*?)<\/link>/g);
        if (linksMatch) {
          const links = linksMatch
            .map(l => l.replace('<link>', '').replace('</link>', '').trim())
            .filter(l => l.startsWith('http') && l !== 'https://vnexpress.net' && l !== 'https://cafef.vn' && l !== 'https://vneconomy.vn/dia-oc' && !l.includes('znews.vn/bat-dong-san'));
          allLinks.push(...links.slice(0, 3)); // Lấy 3 bài mới nhất mỗi trang
        }
      } catch (e) {
        console.error(`Failed to fetch RSS: ${feed}`);
      }
    }

    if (allLinks.length === 0) {
      return NextResponse.json({ message: 'No links found' });
    }

    // Lọc trùng lặp mảng
    allLinks = Array.from(new Set(allLinks));

    // 3. Kiểm tra trùng lặp trên Sanity
    const sanityToken = process.env.SANITY_API_TOKEN;
    if (!sanityToken) return NextResponse.json({ error: 'Missing SANITY_API_TOKEN' }, { status: 500 });
    const adminClient = client.withConfig({ token: sanityToken });

    // Lấy tất cả sourceUrl đã có trong database
    const existingPosts = await adminClient.fetch(`*[_type == "post" && defined(sourceUrl)].sourceUrl`);
    
    // Tìm ra 1 bài viết MỚI NHẤT chưa từng cào
    const newLink = allLinks.find(link => !existingPosts.includes(link));

    if (!newLink) {
      return NextResponse.json({ message: 'No new articles to crawl.' });
    }

    // 4. Gửi lệnh cho hệ thống AI Writer tự động xử lý bài viết này
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https');
    const aiWriterUrl = `${protocol}://${host}/api/ai-writer`;

    const aiRes = await fetch(aiWriterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'url', data: newLink })
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      return NextResponse.json({ error: 'AI Writer failed', details: errorText }, { status: 500 });
    }

    const aiResult = await aiRes.json();

    // 5. Cập nhật sourceUrl vào bản nháp vừa tạo để lưu vết
    if (aiResult.docId) {
      await adminClient.patch(aiResult.docId)
        .set({ sourceUrl: newLink })
        .commit();
    }

    return NextResponse.json({ 
      message: 'Crawled and rewritten successfully!', 
      source: newLink,
      docId: aiResult.docId 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
