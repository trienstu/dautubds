import { NextResponse } from 'next/server';
import { client } from '../../../../../sanity/lib/client';
import { GoogleGenAI } from '@google/genai';
import { htmlToBlocks } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';
import { JSDOM } from 'jsdom';

export const maxDuration = 60; // 60s runtime limit

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function generateSvgLogo(name: string): Buffer {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'BDS';

  const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#grad)" />
  <circle cx="256" cy="256" r="180" fill="none" stroke="url(#gold)" stroke-width="6" opacity="0.6" stroke-dasharray="12 6" />
  <text x="256" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="140" font-weight="800" fill="url(#gold)" text-anchor="middle" letter-spacing="4">
    ${initials}
  </text>
  <text x="256" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#94a3b8" text-anchor="middle" letter-spacing="6">
    DEVELOPER
  </text>
</svg>`;

  return Buffer.from(svg, 'utf-8');
}

export async function POST(request: Request) {
  try {
    const { developerName, customNotes } = await request.json();
    if (!developerName || !developerName.trim()) {
      return NextResponse.json({ error: 'Tên chủ đầu tư là bắt buộc' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });

    const sanityToken = process.env.SANITY_API_TOKEN;
    if (!sanityToken) return NextResponse.json({ error: 'Thiếu SANITY_API_TOKEN' }, { status: 500 });

    const adminClient = client.withConfig({ token: sanityToken });

    // 1. Prompt AI tra cứu và biên soạn hồ sơ Chủ Đầu Tư
    const prompt = `Bạn là Chuyên gia thẩm định hồ sơ Chủ Đầu Tư Bất Động Sản hàng đầu Việt Nam kiêm Nhà báo điều tra tài chính.
Hãy tra cứu Internet và tạo một hồ sơ thương hiệu toàn diện, chính xác và chuyên sâu về Chủ Đầu Tư sau:

TÊN CHỦ ĐẦU TƯ: ${developerName}
${customNotes ? `GHI CHÚ / YÊU CẦU BỔ SUNG TỪ NGƯỜI DÙNG: ${customNotes}` : ''}

QUY CHUẨN NỘI DUNG (NOTI CONTENT SKILL - BRAND STORYTELLING & AUTHORITY):
1. Tính chính xác: Tra cứu thông tin chuẩn xác về năm thành lập, trụ sở chính, người sáng lập/lãnh đạo, mã cổ phiếu (nếu có).
2. Hồ sơ năng lực & Dự án: Liệt kê các dự án tiêu biểu (tên dự án, vị trí, quy mô, tiến độ bàn giao, thực tế cấp sổ hồng).
3. Đánh giá chuyên sâu: Phân tích thế mạnh tài chính, phong cách thiết kế, chất lượng hoàn thiện công trình, năng lực quản lý vận hành và uy tín cam kết với cư dân/nhà đầu tư.
4. Bảng biểu so sánh: BẮT BUỘC có 1 bảng HTML <table> tổng hợp danh mục dự án trọng điểm (Cột: Dự án | Vị trí | Loại hình | Năm bàn giao | Tình trạng sổ hồng).
5. Chuẩn SEO/AEO: Định dạng HTML (<h2>, <h3>, <p>, <ul>, <li>, <table>). Heading viết kiểu Sentence case (chỉ viết hoa chữ cái đầu câu). Không dùng văn mẫu bot sáo rỗng.
6. Logo URL: Tìm kiếm URL hình ảnh logo chính thức (PNG hoặc SVG nền trong suốt) của chủ đầu tư này.

YÊU CẦU ĐẦU RA BẮT BUỘC (Chỉ trả về JSON hợp lệ, không bọc trong markdown code block, không giải thích gì thêm):
{
  "name": "Tên chuẩn xác đầy đủ của Chủ Đầu Tư (ví dụ: Tập đoàn Vingroup, Masterise Homes, Khang Điền...)",
  "location": "Trụ sở chính hoặc khu vực hoạt động mạnh (ví dụ: TP. Hồ Chí Minh, Hà Nội)",
  "foundedYear": "Năm thành lập (ví dụ: 1993, 2007... chỉ lấy 4 chữ số năm)",
  "country": "Việt Nam",
  "logoUrl": "URL ảnh logo chính thức của chủ đầu tư nếu tìm thấy (phải bắt đầu bằng http/https). Nếu không chắc chắn, để rỗng",
  "seoTitle": "Tiêu đề SEO dưới 60 ký tự (ví dụ: Chủ đầu tư Masterise Homes - Hồ sơ năng lực & Dự án 2026)",
  "seoDescription": "Đoạn mô tả SEO dưới 160 ký tự, súc tích và hấp dẫn",
  "content": "Toàn bộ nội dung bài viết giới thiệu chủ đầu tư định dạng HTML (<h2>, <h3>, <p>, <ul>, <li>, <table>). Không chứa thẻ <h1>, <html>, <body>."
}`;

    // 2. Gọi Gemini 2.5 Flash kèm Google Search
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const aiText = response.text?.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    if (!aiText) throw new Error('AI không trả về kết quả');

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      // Thử regex trích xuất JSON nếu có text bao quanh
      const match = aiText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('AI không trả về đúng định dạng JSON: ' + aiText.slice(0, 200));
      }
    }

    const officialName = parsed.name || developerName;
    const slugCurrent = toSlug(officialName);

    // 3. Xử lý Logo (Fetch logo thực tế hoặc fallback sang SVG logo gradient sang trọng)
    let logoAssetId: string | null = null;
    if (parsed.logoUrl && parsed.logoUrl.startsWith('http')) {
      try {
        const logoRes = await fetch(parsed.logoUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
        });
        if (logoRes.ok) {
          const buffer = await logoRes.arrayBuffer();
          const contentType = logoRes.headers.get('content-type') || 'image/png';
          const ext = contentType.includes('svg') ? 'svg' : 'png';
          const asset = await adminClient.assets.upload('image', Buffer.from(buffer), {
            filename: `${slugCurrent}-logo.${ext}`,
            contentType
          });
          logoAssetId = asset._id;
        }
      } catch (err) {
        console.warn('Không tải được logo từ URL:', parsed.logoUrl, err);
      }
    }

    // Nếu không có logo từ web, tạo SVG Logo vector sang trọng đảm bảo 100% hợp lệ
    if (!logoAssetId) {
      const svgBuffer = generateSvgLogo(officialName);
      const asset = await adminClient.assets.upload('image', svgBuffer, {
        filename: `${slugCurrent}-brand-logo.svg`,
        contentType: 'image/svg+xml'
      });
      logoAssetId = asset._id;
    }

    // 4. Convert HTML content sang PortableText
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
          type: 'image',
          name: 'image'
        },
        {
          type: 'object',
          name: 'developerDoc',
          fields: [{ name: 'description', type: 'array', of: [{ type: 'block' }, { type: 'table' }, { type: 'image' }] }],
        },
      ],
    });

    const blockContentType = defaultSchema.get('developerDoc').fields.find((f: any) => f.name === 'description').type;

    const blocks = htmlToBlocks(parsed.content || `<p>${officialName} là một trong những chủ đầu tư uy tín trên thị trường bất động sản.</p>`, blockContentType, {
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

    // 5. Kiểm tra xem chủ đầu tư đã tồn tại chưa để update hoặc tạo mới
    const existing = await adminClient.fetch(`*[_type == "developer" && slug.current == $slug][0]{ _id }`, {
      slug: slugCurrent
    });

    const docId = existing?._id || `developer-${slugCurrent}`;

    const docPayload: any = {
      _type: 'developer',
      _id: docId,
      name: officialName,
      slug: {
        _type: 'slug',
        current: slugCurrent
      },
      location: parsed.location || 'TP. Hồ Chí Minh',
      foundedYear: parsed.foundedYear ? String(parsed.foundedYear) : undefined,
      country: parsed.country || 'Việt Nam',
      isFeatured: true,
      logo: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: logoAssetId
        }
      },
      description: blocks,
      seo: {
        _type: 'seo',
        seoTitle: parsed.seoTitle || `Chủ đầu tư ${officialName} - Thông tin & Dự án mới nhất`,
        seoDescription: parsed.seoDescription || `Tìm hiểu chi tiết năng lực, uy tín và danh mục các dự án của chủ đầu tư ${officialName}.`
      }
    };

    const savedDoc = await adminClient.createOrReplace(docPayload);

    return NextResponse.json({
      success: true,
      documentId: savedDoc._id,
      name: officialName,
      slug: slugCurrent,
      location: docPayload.location,
      foundedYear: docPayload.foundedYear,
      viewUrl: `/chu-dau-tu/${slugCurrent}`,
      studioUrl: `/admin/intent/edit/id=${savedDoc._id};type=developer`
    });

  } catch (error: any) {
    console.error('Lỗi khi tạo hồ sơ Chủ Đầu Tư:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý server' }, { status: 500 });
  }
}
