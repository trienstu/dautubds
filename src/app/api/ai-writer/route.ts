import { NextResponse } from 'next/server';
import { client } from '../../../../sanity/lib/client';
import { GoogleGenAI } from '@google/genai';
import { htmlToBlocks } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';
import { JSDOM } from 'jsdom';

export async function POST(request: Request) {
  try {
    const { url, type, data } = await request.json();
    const mode = type || 'url';
    const input = data || url;
    if (!input) return NextResponse.json({ error: 'Input is required' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });

    const sanityToken = process.env.SANITY_API_TOKEN;
    if (!sanityToken) return NextResponse.json({ error: 'Thiếu SANITY_API_TOKEN trong file .env.local' }, { status: 500 });

    const adminClient = client.withConfig({ token: sanityToken });

    let sourceContent = '';
    if (mode === 'url') {
      // 1. Crawl content with Jina Reader
      const jinaRes = await fetch(`https://r.jina.ai/${input}`, {
        headers: {
          'Accept': 'text/plain',
          'X-Return-Format': 'markdown'
        }
      });
      
      if (!jinaRes.ok) throw new Error('Failed to crawl URL');
      sourceContent = await jinaRes.text();
    }

    // 2. Compose Prompt & Config
    let prompt = '';
    let tools: any = undefined;

    const outputFormat = `
    YÊU CẦU ĐẦU RA BẮT BUỘC (Chỉ trả về JSON hợp lệ, không bọc trong markdown code block, không giải thích gì thêm):
    {
      "title": "Tiêu đề giật tít, hấp dẫn, chứa từ khóa chính",
      "excerpt": "Đoạn mô tả ngắn gọn (meta description) chuẩn SEO dưới 160 ký tự",
      "content": "Nội dung bài viết được định dạng bằng HTML. Sử dụng <h2>, <h3>, <p>, <ul>, <li>, <table> (nếu có dữ liệu bảng). Tuyệt đối không dùng <h1>. Văn phong tự nhiên, cuốn hút.",
      "imageUrl": "Tìm trong markdown gốc xem có URL ảnh chính nào không, nếu có hãy trích xuất ra đây để tôi dùng làm thumbnail. Nếu không có, để rỗng."
    }`;

    if (mode === 'url') {
      prompt = `Bạn là một biên tập viên bất động sản xuất sắc. Hãy viết lại bài viết sau để nó trở thành một bài tin tức độc nhất (unique 100%), chuẩn SEO, văn phong chuyên nghiệp, không trùng lặp với bất kỳ bài nào khác.
      
      Bài viết gốc:
      ${sourceContent}
      
      ${outputFormat}`;
    } else {
      prompt = `Bạn là một chuyên gia bất động sản xuất sắc. Hãy tự động tìm kiếm thông tin mới nhất trên mạng Internet và viết một bài tin tức cực kỳ chi tiết, độc nhất (unique 100%), chuẩn SEO, văn phong chuyên nghiệp, phân tích chuyên sâu về chủ đề sau.
      
      Chủ đề yêu cầu:
      ${input}
      
      ${outputFormat}`;
      tools = [{ googleSearch: {} }];
    }

    // 3. Generate with Gemini
    const ai = new GoogleGenAI({ apiKey });
    
    const config: any = {};
    if (tools) {
      config.tools = tools;
    } else {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: config
    });

    const aiText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
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
        const asset = await adminClient.assets.upload('image', Buffer.from(buffer), {
          filename: 'ai-thumbnail.jpg'
        });
        imageAssetId = asset._id;
      } catch (err) {
        console.error('Failed to upload image', err);
      }
    }

    // 4. Convert HTML to Sanity Portable Text Blocks
    const defaultSchema = Schema.compile({
      name: 'default',
      types: [
        {
          type: 'object',
          name: 'tableRow',
          fields: [{ name: 'cells', type: 'array', of: [{ type: 'string' }] }]
        },
        {
          type: 'object',
          name: 'table',
          fields: [{ name: 'rows', type: 'array', of: [{ type: 'tableRow' }] }]
        },
        {
          type: 'object',
          name: 'blogPost',
          fields: [{ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'table' }] }],
        },
      ],
    });
    const blockContentType = defaultSchema.get('blogPost').fields.find((f: any) => f.name === 'body').type;
    
    const blocks = htmlToBlocks(result.content, blockContentType, {
      parseHtml: (html) => new JSDOM(html).window.document,
      rules: [
        {
          deserialize(el: any, next: any, block: any) {
            if (el.tagName && el.tagName.toLowerCase() === 'table') {
              const trs = Array.from(el.querySelectorAll('tr'));
              const rows = trs.map((tr: any) => {
                const cells = Array.from(tr.querySelectorAll('th, td')).map((td: any) => td.textContent || '');
                return {
                  _type: 'tableRow',
                  _key: Math.random().toString(36).substring(7),
                  cells
                };
              });
              return block({
                _type: 'table',
                _key: Math.random().toString(36).substring(7),
                rows
              });
            }
            return undefined;
          }
        }
      ]
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

    const createdDoc = await adminClient.create(doc);

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
