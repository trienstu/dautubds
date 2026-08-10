import { NextResponse } from 'next/server';
import { client } from '../../../../sanity/lib/client';
import { GoogleGenAI } from '@google/genai';
import { htmlToBlocks } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';
import { JSDOM } from 'jsdom';

export const maxDuration = 60; // Up to 60s execution

// Helper to process in-content images within an HTML section
async function processHtmlSectionImages(htmlContent: string, adminClient: any): Promise<string> {
  if (!htmlContent) return '';
  try {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const images = Array.from(document.querySelectorAll('img'));

    for (const img of images as any[]) {
      const src = img.getAttribute('src');
      if (src && src.startsWith('http')) {
        try {
          const imgRes = await fetch(src, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            if (contentType.includes('image')) {
              const asset = await adminClient.assets.upload('image', Buffer.from(buffer), {
                filename: `section-img-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
              });
              // Replace src with Sanity Asset ID
              img.setAttribute('src', asset._id);
            } else {
              img.remove();
            }
          } else {
            img.remove();
          }
        } catch (err) {
          console.error(`Failed uploading section image: ${src}`, err);
          img.remove();
        }
      }
    }
    return document.body.innerHTML;
  } catch (e) {
    console.error('DOM parsing error:', e);
    return htmlContent;
  }
}

// Helper to convert HTML string to PortableText blocks
function convertHtmlToPortableText(htmlContent: string) {
  if (!htmlContent) return [];
  
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
        name: 'projectDoc',
        fields: [{ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'table' }, { type: 'image' }] }],
      },
    ],
  });
  
  const blockContentType = defaultSchema.get('projectDoc').fields.find((f: any) => f.name === 'body').type;
  
  return htmlToBlocks(htmlContent, blockContentType, {
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
          if (el.tagName && el.tagName.toLowerCase() === 'img') {
            const src = el.getAttribute('src');
            if (src && src.startsWith('image-')) {
              return block({
                _type: 'image',
                _key: Math.random().toString(36).substring(7),
                asset: {
                  _type: 'reference',
                  _ref: src
                }
              });
            }
          }
          return undefined;
        }
      }
    ]
  });
}

// Helper to extract clean image URLs from scraped texts
function extractImageUrls(texts: string[]): string[] {
  const urls = new Set<string>();
  
  for (const text of texts) {
    // Match Markdown images ![alt](url)
    const mdMatches = text.matchAll(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g);
    for (const match of mdMatches) {
      if (match[1]) urls.add(match[1]);
    }
    
    // Match HTML img src
    const htmlMatches = text.matchAll(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi);
    for (const match of htmlMatches) {
      if (match[1]) urls.add(match[1]);
    }
  }

  // Filter out logos, icons, avatars, svgs, base64
  return Array.from(urls).filter(url => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.svg') || lower.includes('data:image')) return false;
    if (lower.includes('logo') || lower.includes('icon') || lower.includes('avatar') || lower.includes('favicon')) return false;
    if (lower.includes('button') || lower.includes('banner-ads') || lower.includes('qrcode')) return false;
    return true;
  });
}

export async function POST(request: Request) {
  try {
    const { urls, url } = await request.json();
    
    // Normalize URLs input into array
    let urlList: string[] = [];
    if (Array.isArray(urls)) {
      urlList = urls.filter(u => typeof u === 'string' && u.trim().startsWith('http'));
    } else if (typeof urls === 'string') {
      urlList = urls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
    } else if (typeof url === 'string' && url.trim().startsWith('http')) {
      urlList = [url.trim()];
    }

    if (urlList.length === 0) {
      return NextResponse.json({ error: 'Vui lòng cung cấp ít nhất 1 đường link hợp lệ (bắt đầu bằng http)' }, { status: 400 });
    }

    // Limit to max 5 URLs
    const targetUrls = urlList.slice(0, 5);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });

    const sanityToken = process.env.SANITY_API_TOKEN;
    if (!sanityToken) return NextResponse.json({ error: 'Thiếu SANITY_API_TOKEN trong file .env.local' }, { status: 500 });

    const adminClient = client.withConfig({ token: sanityToken });

    // 1. Crawl all URLs in parallel with Jina Reader
    const crawledResults = await Promise.allSettled(
      targetUrls.map(async (linkUrl) => {
        const jinaRes = await fetch(`https://r.jina.ai/${encodeURIComponent(linkUrl)}`, {
          headers: {
            'Accept': 'text/plain',
            'X-Return-Format': 'markdown'
          }
        });
        if (!jinaRes.ok) throw new Error(`Crawl failed for ${linkUrl}`);
        const text = await jinaRes.text();
        return { url: linkUrl, text };
      })
    );

    const successfulSources = crawledResults
      .filter((r): r is PromiseFulfilledResult<{ url: string; text: string }> => r.status === 'fulfilled')
      .map(r => r.value);

    if (successfulSources.length === 0) {
      return NextResponse.json({ error: 'Không thể cào dữ liệu từ bất kỳ đường link nào đã cung cấp' }, { status: 500 });
    }

    // Extract images from all scraped texts
    const extractedImages = extractImageUrls(successfulSources.map(s => s.text));

    // Combine source contents
    const combinedContent = successfulSources
      .map((src, idx) => `=== NGUỒN ${idx + 1} (${src.url}) ===\n${src.text}`)
      .join('\n\n');

    // 2. Compose Prompt for Gemini AI
    const outputFormat = `
    YÊU CẦU ĐẦU RA BẮT BUỘC (Trả về duy nhất 1 object JSON hợp lệ, không bọc code block markdown):
    {
      "title": "Tên dự án đầy đủ chuẩn SEO (Sentence case - chỉ viết hoa chữ cái đầu câu và tên riêng). Phải chứa từ khóa dự án.",
      "category": "Chọn 1 trong các giá trị: Biệt thự | Nhà phố | Căn hộ | Đất nền",
      "price": "Mức giá trung bình hoặc khoảng giá (Ví dụ: 45 triệu/m² hoặc 3.5 - 7 tỷ/căn)",
      "productCount": "Tổng số lượng sản phẩm (Ví dụ: 1200 căn hộ)",
      "status": "Chọn 1 trong các giá trị: Đang mở bán | Sắp ra mắt | Đã bàn giao",
      "location": "Vị trí địa lý ngắn gọn (Ví dụ: Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh)",
      "excerpt": "Đoạn giới thiệu ngắn 1-2 câu chuẩn SEO dưới 160 ký tự.",
      "descriptionHtml": "Nội dung TỔNG QUAN DỰ ÁN dạng HTML (Dùng h3 dạng Sentence case cho các tiêu đề phụ, p, ul, li, table. TUYỆT ĐỐI KHÔNG DÙNG THẺ H2 ở đầu. Hãy chọn 1-2 URL ảnh phù hợp từ DANH SÁCH ẢNH TÌM THẤY để chèn thẻ <img src='URL' alt='...' /> vào bài).",
      "featuresList": ["Danh sách tiện ích 1", "Danh sách tiện ích 2", "Danh sách tiện ích 3"... (6-10 tiện ích tiêu biểu ngắn gọn)],
      "featuresHtml": "Bài viết chi tiết về TIỆN ÍCH DỰ ÁN dạng HTML (Mô tả tiện ích nội khu/ngoại khu. TUYỆT ĐỐI KHÔNG DÙNG H2 ở đầu. Chọn 1-2 URL ảnh tiện ích chèn thẻ <img src='URL' alt='...' />).",
      "locationHtml": "Bài viết chi tiết về VỊ TRÍ & HẠ TẦNG GIAO THÔNG dạng HTML (Mô tả kết nối giao thông. TUYỆT ĐỐI KHÔNG DÙNG H2 ở đầu. Chọn 1 URL ảnh bản đồ/sơ đồ vị trí chèn thẻ <img src='URL' alt='...' />).",
      "pricingHtml": "Bài viết chi tiết về BẢNG GIÁ & CHÍNH SÁCH THANH TOÁN dạng HTML (Tiến độ thanh toán, ưu đãi. TUYỆT ĐỐI KHÔNG DÙNG H2 ở đầu. Chọn 1 URL ảnh mặt bằng/bảng giá chèn thẻ <img src='URL' alt='...' /> nếu có).",
      "legalHtml": "Bài viết chi tiết về PHÁP LÝ DỰ ÁN dạng HTML (Quy hoạch 1/500, Giấy phép xây dựng, Hình thức sở hữu. TUYỆT ĐỐI KHÔNG DÙNG H2 ở đầu).",
      "faqs": [
        { "question": "Câu hỏi 1 về dự án", "answer": "Câu trả lời chi tiết" },
        { "question": "Câu hỏi 2 về dự án", "answer": "Câu trả lời chi tiết" },
        { "question": "Câu hỏi 3 về dự án", "answer": "Câu trả lời chi tiết" }
      ],
      "selectedImages": ["URL ảnh 1", "URL ảnh 2", "URL ảnh 3"... (Chọn ra 4-6 URL ảnh đẹp đại diện làm bộ sưu tập Gallery)]
    }`;

    const prompt = `Bạn là một chuyên gia bất động sản hàng đầu Việt Nam. Dưới đây là nội dung thô tổng hợp từ ${successfulSources.length} nguồn bài viết về một dự án bất động sản.
    
Hãy tự động tổng hợp, đọc hiểu, chọn lọc các dữ liệu chính xác nhất, loại bỏ thông tin trùng lặp hoặc mâu thuẫn, và biên soạn thành một bài giới thiệu dự án BĐS hoàn chỉnh, chuyên nghiệp, 100% Unique, đạt chuẩn SEO cao nhất.

LƯU Ý QUAN TRỌNG VỀ THẺ HẾT ĐỊNH DẠNG & HÌNH ẢNH TRONG BÀI:
1. Giao diện dự án ở Frontend ĐÃ TỰ ĐỘNG CÓ THẺ <h2> Tiêu đề cho mỗi phần (Tổng Quan, Vị Trí, Tiện Ích, Bảng Giá, Pháp Lý). 
   Vì vậy trong các trường descriptionHtml, featuresHtml, locationHtml, pricingHtml, legalHtml: TUYỆT ĐỐI KHÔNG CHÈN THẺ <h2> Ở ĐẦU! Chỉ dùng <h3> cho các tiêu đề phụ bên trong hoặc thẻ <p>, <ul>, <li>, <table>.
2. HÌNH ẢNH TRONG TỪNG MỤC: Hãy chủ động chèn các thẻ <img src="URL" alt="mô tả" /> vào giữa các đoạn văn trong từng mục (ví dụ chèn ảnh vị trí/sơ đồ vào locationHtml, chèn ảnh tiện ích vào featuresHtml, chèn ảnh tổng quan/mặt bằng vào descriptionHtml/pricingHtml). Lấy URL ảnh từ danh sách bên dưới.

DANH SÁCH ẢNH TÌM THẤY TỪ CÁC NGUỒN (Dùng các URL này để chèn vào thẻ <img src="...">):
${JSON.stringify(extractedImages.slice(0, 25), null, 2)}

DỮ LIỆU NGUỒN TỔNG HỢP:
${combinedContent}

${outputFormat}`;

    // 3. Generate content with Gemini API
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const aiText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!aiText) throw new Error('AI không trả về dữ liệu');

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(aiText);
    } catch (e) {
      throw new Error('Dữ liệu từ AI không phải dạng JSON hợp lệ');
    }

    // 4. Process in-content images for each HTML section (Upload images to Sanity Assets & replace src)
    const [
      processedDescHtml,
      processedLocHtml,
      processedFeatHtml,
      processedPriceHtml,
      processedLegalHtml
    ] = await Promise.all([
      processHtmlSectionImages(parsedResult.descriptionHtml || '', adminClient),
      processHtmlSectionImages(parsedResult.locationHtml || '', adminClient),
      processHtmlSectionImages(parsedResult.featuresHtml || '', adminClient),
      processHtmlSectionImages(parsedResult.pricingHtml || '', adminClient),
      processHtmlSectionImages(parsedResult.legalHtml || '', adminClient)
    ]);

    // 5. Download & Upload Gallery & Cover images
    const imagesToUpload: string[] = Array.isArray(parsedResult.selectedImages) && parsedResult.selectedImages.length > 0
      ? parsedResult.selectedImages.filter((u: string) => typeof u === 'string' && u.startsWith('http'))
      : extractedImages.slice(0, 6);

    const galleryAssets: any[] = [];

    for (let i = 0; i < Math.min(imagesToUpload.length, 6); i++) {
      try {
        const imgUrl = imagesToUpload[i];
        const imgRes = await fetch(imgUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          if (contentType.includes('image')) {
            const asset = await adminClient.assets.upload('image', Buffer.from(buffer), {
              filename: `project-gallery-${Date.now()}-${i}.jpg`
            });
            galleryAssets.push({
              _type: 'image',
              _key: Math.random().toString(36).substring(7),
              asset: { _type: 'reference', _ref: asset._id }
            });
          }
        }
      } catch (err) {
        console.error(`Failed uploading gallery image ${i}:`, err);
      }
    }

    // 6. Convert HTML sections to Sanity PortableText Blocks
    const descriptionBlocks = convertHtmlToPortableText(processedDescHtml);
    const locationBlocks = convertHtmlToPortableText(processedLocHtml);
    const featuresBlocks = convertHtmlToPortableText(processedFeatHtml);
    const pricingBlocks = convertHtmlToPortableText(processedPriceHtml);
    const legalBlocks = convertHtmlToPortableText(processedLegalHtml);

    // Format FAQs array for Sanity (Field name: faqs)
    const formattedFaqs = Array.isArray(parsedResult.faqs)
      ? parsedResult.faqs.map((q: any) => ({
          _type: 'object',
          _key: Math.random().toString(36).substring(7),
          question: q.question || '',
          answer: q.answer || ''
        }))
      : [];

    // 7. Create Draft Project Document in Sanity
    const slugCurrent = (parsedResult.title || 'du-an-moi')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const doc: any = {
      _type: 'project',
      _id: `drafts.project-${Date.now()}`,
      title: parsedResult.title,
      slug: {
        _type: 'slug',
        current: slugCurrent
      },
      category: parsedResult.category || 'Căn hộ',
      price: parsedResult.price || '',
      productCount: parsedResult.productCount || '',
      status: parsedResult.status || 'Đang mở bán',
      location: parsedResult.location || '',
      excerpt: parsedResult.excerpt || '',
      description: descriptionBlocks,
      locationContent: locationBlocks,
      features: Array.isArray(parsedResult.featuresList) ? parsedResult.featuresList : [],
      featuresContent: featuresBlocks,
      pricingContent: pricingBlocks,
      legalContent: legalBlocks,
      faqs: formattedFaqs,
    };

    // If gallery images uploaded, set cover image (imageUrl) and gallery array
    if (galleryAssets.length > 0) {
      doc.imageUrl = galleryAssets[0]; // Set first image as cover image
      doc.gallery = galleryAssets;     // Set full gallery array
    }

    const createdDoc = await adminClient.create(doc);

    return NextResponse.json({
      success: true,
      documentId: createdDoc._id,
      title: createdDoc.title,
      sourcesCount: successfulSources.length,
      imagesUploaded: galleryAssets.length,
      studioUrl: `/admin/intent/edit/id=${createdDoc._id};type=project`
    });

  } catch (error: any) {
    console.error('AI Project Writer error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý tạo dự án bằng AI' }, { status: 500 });
  }
}
