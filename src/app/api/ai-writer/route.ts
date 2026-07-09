import { NextResponse } from 'next/server';
import { client } from '../../../../sanity/lib/client';
import { GoogleGenAI } from '@google/genai';
import { htmlToBlocks } from '@sanity/block-tools';
import { JSDOM } from 'jsdom';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });

    // 1. Crawl content with Jina Reader
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'markdown'
      }
    });
    
    if (!jinaRes.ok) throw new Error('Failed to crawl URL');
    const markdown = await jinaRes.text();

    // 2. Rewrite with Gemini
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Bạn là một biên tập viên bất động sản xuất sắc. Hãy viết lại bài viết sau để nó trở thành một bài tin tức độc nhất (unique 100%), chuẩn SEO, văn phong chuyên nghiệp, không trùng lặp với bất kỳ bài nào khác.
    
    Bài viết gốc:
    ${markdown}
    
    YÊU CẦU ĐẦU RA BẮT BUỘC (Chỉ trả về JSON hợp lệ, không bọc trong markdown code block, không giải thích gì thêm):
    {
      "title": "Tiêu đề giật tít, hấp dẫn, chứa từ khóa chính",
      "excerpt": "Đoạn mô tả ngắn gọn (meta description) chuẩn SEO dưới 160 ký tự",
      "content": "Nội dung bài viết được định dạng bằng HTML. Sử dụng <h2>, <h3>, <p>, <ul>, <li>. Tuyệt đối không dùng <h1>. Văn phong tự nhiên, cuốn hút.",
      "imageUrl": "Tìm trong markdown gốc xem có URL ảnh chính nào không, nếu có hãy trích xuất ra đây để tôi dùng làm thumbnail. Nếu không có, để rỗng."
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const aiText = response.text();
    if (!aiText) throw new Error('AI returned empty response');
    
    let result;
    try {
      result = JSON.parse(aiText);
    } catch (e) {
      throw new Error('AI did not return valid JSON');
    }

    // 3. Upload thumbnail if exists
    let imageAssetId = null;
    if (result.imageUrl && result.imageUrl.startsWith('http')) {
      try {
        const imgRes = await fetch(result.imageUrl);
        const buffer = await imgRes.arrayBuffer();
        const asset = await client.assets.upload('image', Buffer.from(buffer), {
          filename: 'ai-thumbnail.jpg'
        });
        imageAssetId = asset._id;
      } catch (err) {
        console.error('Failed to upload image', err);
      }
    }

    // 4. Convert HTML to Sanity Portable Text Blocks
    const blocks = htmlToBlocks(result.content, 'block', {
      parseHtml: (html) => new JSDOM(html).window.document,
    });

    // 5. Create Draft Document in Sanity
    const doc = {
      _type: 'post',
      _id: `drafts.ai-${Date.now()}`,
      title: result.title,
      slug: {
        _type: 'slug',
        current: result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
      },
      excerpt: result.excerpt,
      content: blocks,
      seo: {
        seoTitle: result.title,
        seoDescription: result.excerpt,
      }
    };

    if (imageAssetId) {
      (doc as any).imageUrl = {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAssetId }
      };
    }

    const createdDoc = await client.create(doc);

    return NextResponse.json({ 
      success: true, 
      documentId: createdDoc._id,
      studioUrl: `/admin/intent/edit/id=${createdDoc._id};type=post`
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
