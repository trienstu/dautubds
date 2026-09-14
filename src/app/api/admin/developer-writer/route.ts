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

async function fetchAndUploadLogo(adminClient: any, url: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('image') && !contentType.includes('octet-stream')) {
      return null;
    }
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 600) return null; // Bỏ qua pixel tracker
    const ext = contentType.includes('svg') ? 'svg' : contentType.includes('webp') ? 'webp' : contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
    const asset = await adminClient.assets.upload('image', Buffer.from(buffer), {
      filename: `${slug}-logo.${ext}`,
      contentType: contentType.includes('image') ? contentType : 'image/png'
    });
    return asset._id;
  } catch (err) {
    console.warn('fetchAndUploadLogo error for:', url, err);
    return null;
  }
}

async function resolveDeveloperLogo(
  adminClient: any, 
  slug: string, 
  officialName: string, 
  customLogoUrl?: string, 
  aiLogoUrl?: string, 
  websiteUrl?: string
): Promise<string> {
  // 1. Ưu tiên 1: Người dùng nhập customLogoUrl
  if (customLogoUrl && customLogoUrl.startsWith('http')) {
    const id = await fetchAndUploadLogo(adminClient, customLogoUrl, slug);
    if (id) return id;
    if (!websiteUrl) websiteUrl = customLogoUrl;
  }

  // 2. Ưu tiên 2: URL ảnh trực tiếp AI tìm thấy
  if (aiLogoUrl && aiLogoUrl.startsWith('http')) {
    const id = await fetchAndUploadLogo(adminClient, aiLogoUrl, slug);
    if (id) return id;
  }

  // 3. Ưu tiên 3: Tự động cào website chủ đầu tư để bóc tách thẻ <img> logo thật hoặc icon chất lượng cao
  if (websiteUrl && websiteUrl.startsWith('http')) {
    try {
      const siteUrlObj = new URL(websiteUrl);
      const origin = siteUrlObj.origin;
      const res = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const html = await res.text();
        const candidateImgs: string[] = [];

        // Tìm các thẻ <img> có src, alt, hoặc class chứa logo/brand
        const imgMatches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi));
        for (const match of imgMatches) {
          const fullTag = match[0].toLowerCase();
          const src = match[1];
          if (fullTag.includes('logo') || src.toLowerCase().includes('logo') || fullTag.includes('brand')) {
            candidateImgs.push(src);
          }
        }

        // Tìm thẻ <link rel="icon" | "apple-touch-icon">
        const linkMatches = Array.from(html.matchAll(/<link[^>]+rel=["']([^"']*(?:icon|apple-touch-icon)[^"']*)["'][^>]+href=["']([^"']+)["']/gi));
        for (const match of linkMatches) {
          candidateImgs.push(match[2]);
        }

        for (const rawSrc of candidateImgs) {
          let resolvedSrc = rawSrc;
          if (rawSrc.startsWith('//')) {
            resolvedSrc = 'https:' + rawSrc;
          } else if (rawSrc.startsWith('/')) {
            resolvedSrc = origin + rawSrc;
          } else if (!rawSrc.startsWith('http')) {
            resolvedSrc = origin + '/' + rawSrc;
          }

          const id = await fetchAndUploadLogo(adminClient, resolvedSrc, slug);
          if (id) return id;
        }

        // Thử Google Favicon 256px từ tên miền chính
        const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${siteUrlObj.hostname}&sz=256`;
        const googleFaviconId = await fetchAndUploadLogo(adminClient, googleFaviconUrl, slug);
        if (googleFaviconId) return googleFaviconId;
      }
    } catch (siteErr) {
      console.warn('Lỗi khi cào logo từ website chủ đầu tư:', siteErr);
    }
  }

  // 4. Fallback: Tạo SVG vector thương hiệu đảm bảo 100% tài liệu luôn hợp lệ
  const svgBuffer = generateSvgLogo(officialName);
  const asset = await adminClient.assets.upload('image', svgBuffer, {
    filename: `${slug}-brand-logo.svg`,
    contentType: 'image/svg+xml'
  });
  return asset._id;
}


export async function POST(request: Request) {
  try {
    const { developerName, customNotes, customLogoUrl } = await request.json();
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

QUY TẮC ĐỊNH DANH BẮT BUỘC:
- Tên chủ đầu tư hiển thị ĐÚNG CHÍNH XÁC LÀ: "${developerName}". Tuyệt đối không tự ý gắn thêm tiền tố "Công ty Cổ phần", "Tập đoàn", "Công ty TNHH" vào tên chính.
- Trong nội dung bài viết và phần phân tích lịch sử, có thể đề cập tên pháp lý đầy đủ, nhưng thương hiệu trọng tâm và tiêu đề luôn là "${developerName}".

QUY CHUẨN NỘI DUNG (NOTI CONTENT SKILL - BRAND STORYTELLING & AUTHORITY):
1. Tính chính xác: Tra cứu thông tin chuẩn xác về năm thành lập, trụ sở chính, người sáng lập/lãnh đạo, mã cổ phiếu (nếu có).
2. Hồ sơ năng lực & Dự án: Liệt kê các dự án tiêu biểu (tên dự án, vị trí, quy mô, tiến độ bàn giao, thực tế cấp sổ hồng). Đặc biệt chú ý các dự án được nhắc đến trong phần ghi chú nếu có.
3. Đánh giá chuyên sâu: Phân tích thế mạnh tài chính, phong cách thiết kế, chất lượng hoàn thiện công trình, năng lực quản lý vận hành và uy tín cam kết với cư dân/nhà đầu tư.
4. Bảng biểu so sánh: BẮT BUỘC có 1 bảng HTML <table> tổng hợp danh mục dự án trọng điểm (Cột: Dự án | Vị trí | Loại hình | Năm bàn giao | Tình trạng sổ hồng).
5. Chuẩn SEO/AEO: Định dạng HTML (<h2>, <h3>, <p>, <ul>, <li>, <table>). Heading viết kiểu Sentence case (chỉ viết hoa chữ cái đầu câu). Không dùng văn mẫu bot sáo rỗng.
6. Website & Logo: Tra cứu chính xác website chính thức của chủ đầu tư (ví dụ: https://huongvietproperties.com...) và URL hình ảnh logo thật (PNG, WEBP hoặc SVG nền trong suốt).

==================================================
YÊU CẦU ĐỊNH DẠNG ĐẦU RA (BẮT BUỘC TRẢ VỀ THEO ĐÚNG 2 PHẦN PHÂN TÁCH DƯỚI ĐÂY, KHÔNG ĐỂ NỘI DUNG HTML BÊN TRONG JSON ĐỂ TRÁNH LỖI PARSE):

<<<METADATA>>>
{
  "name": "Tên chuẩn xác đầy đủ của Chủ Đầu Tư (ví dụ: Công ty Cổ phần Đầu tư Đạt Phước, Tập đoàn Vingroup, Masterise Homes...)",
  "location": "Trụ sở chính hoặc khu vực hoạt động mạnh (ví dụ: TP. Hồ Chí Minh, Bình Dương, Hà Nội)",
  "foundedYear": "Năm thành lập (ví dụ: 2007 - chỉ lấy 4 chữ số năm, nếu không rõ thì để rỗng)",
  "country": "Việt Nam",
  "websiteUrl": "Website chính thức của chủ đầu tư (ví dụ: https://huongvietproperties.com, https://vinhomes.vn...)",
  "logoUrl": "URL trực tiếp file ảnh logo nếu tìm thấy trên web (đuôi .png, .webp, .svg...). Nếu không chắc chắn thì để rỗng",
  "seoTitle": "Tiêu đề SEO dưới 60 ký tự (Sentence case)",
  "seoDescription": "Đoạn mô tả SEO dưới 160 ký tự, súc tích và hấp dẫn"
}
<<<END_METADATA>>>

<<<CONTENT>>>
<h2>1. Tổng quan và lịch sử phát triển</h2>
<p>Nội dung giới thiệu chi tiết...</p>
<h2>2. Danh mục các dự án tiêu biểu và năng lực triển khai</h2>
<p>Phân tích các dự án trọng điểm...</p>
<table>
  <thead>
    <tr>
      <th>Dự án</th>
      <th>Vị trí</th>
      <th>Loại hình</th>
      <th>Năm bàn giao</th>
      <th>Tình trạng sổ hồng</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Tên dự án</td>
      <td>Vị trí</td>
      <td>Căn hộ cao cấp</td>
      <td>2024</td>
      <td>Đã có sổ hồng</td>
    </tr>
  </tbody>
</table>
<h2>3. Uy tín thương hiệu và đánh giá từ chuyên gia</h2>
<p>Nhận định khách quan về năng lực tài chính, pháp lý và tiến độ thi công...</p>
<<<END_CONTENT>>>`;

    // 2. Gọi Gemini 2.5 Flash kèm Google Search
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const aiText = response.text || '';
    if (!aiText.trim()) throw new Error('AI không trả về kết quả');

    // 3. Robust Delimiter Extraction (Bảo đảm 100% không bao giờ lỗi JSON.parse)
    let parsed: any = {};
    let contentHtml = '';

    const metaMatch = aiText.match(/<<<METADATA>>>([\s\S]*?)<<<END_METADATA>>>/i);
    const contentMatch = aiText.match(/<<<CONTENT>>>([\s\S]*?)<<<END_CONTENT>>>/i);

    if (metaMatch) {
      const metaRaw = metaMatch[1].replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        parsed = JSON.parse(metaRaw);
      } catch (err) {
        // Fallback: Trích xuất từng trường bằng regex nếu JSON có ký tự lỗi
        const extractField = (key: string) => {
          const m = metaRaw.match(new RegExp(`"${key}"\s*:\s*"([^"]+)"`, 'i'));
          return m ? m[1] : '';
        };
        parsed = {
          name: extractField('name'),
          location: extractField('location'),
          foundedYear: extractField('foundedYear'),
          country: 'Việt Nam',
          websiteUrl: extractField('websiteUrl'),
          logoUrl: extractField('logoUrl'),
          seoTitle: extractField('seoTitle'),
          seoDescription: extractField('seoDescription')
        };
      }
    }

    if (contentMatch) {
      contentHtml = contentMatch[1].replace(/```html/g, '').replace(/```/g, '').trim();
    }

    // Fallback toàn diện: Nếu AI trả về format JSON cũ mà không có delimiter
    if (!parsed.name) {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Thử làm sạch chuỗi JSON nếu có newline trong string
          const cleaned = jsonMatch[0].replace(/[ -]+/g, ' ');
          const rawParsed = JSON.parse(cleaned);
          parsed = rawParsed;
          if (rawParsed.content) {
            contentHtml = rawParsed.content;
          }
        } catch (e) {
          // Fallback trích xuất regex
          const extractField = (key: string) => {
            const m = aiText.match(new RegExp(`"${key}"\s*:\s*"([^"]+)"`, 'i'));
            return m ? m[1] : '';
          };
          parsed = {
            name: extractField('name'),
            location: extractField('location'),
            foundedYear: extractField('foundedYear'),
            country: 'Việt Nam',
            logoUrl: extractField('logoUrl'),
            seoTitle: extractField('seoTitle'),
            seoDescription: extractField('seoDescription')
          };
        }
      }
    }

    // Nếu vẫn chưa tách được contentHtml, trích xuất tất cả HTML từ thẻ heading đầu tiên
    if (!contentHtml) {
      const htmlStart = aiText.search(/<[hH][1-6]|<[pP]|<[tT]able/);
      if (htmlStart !== -1) {
        contentHtml = aiText.slice(htmlStart).replace(/<<<END_CONTENT>>>/gi, '').replace(/```/g, '').trim();
      } else {
        contentHtml = `<p>${parsed.name || developerName} là một trong những chủ đầu tư uy tín trên thị trường bất động sản.</p>`;
      }
    }

    // Luôn giữ đúng tên chủ đầu tư và slug theo đúng input người dùng nhập vào
    const officialName = developerName.trim();
    const slugCurrent = toSlug(officialName);

    // 4. Xử lý Logo thực tế (Smart Logo Scraper & Multi-Tier Resolution)
    const logoAssetId = await resolveDeveloperLogo(
      adminClient,
      slugCurrent,
      officialName,
      customLogoUrl,
      parsed.logoUrl,
      parsed.websiteUrl
    );

    // 5. Convert HTML content sang PortableText
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

    const blocks = htmlToBlocks(contentHtml, blockContentType, {
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

    // 6. Kiểm tra xem chủ đầu tư đã tồn tại chưa để update hoặc tạo mới
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
