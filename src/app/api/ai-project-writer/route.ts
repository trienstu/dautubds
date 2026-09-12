import { NextResponse } from 'next/server';
import { client } from '../../../../sanity/lib/client';
import { GoogleGenAI } from '@google/genai';
import { Schema } from '@sanity/schema';
import { htmlToBlocks } from '@sanity/block-tools';
import { JSDOM } from 'jsdom';

// Helper function to upload in-content image to Sanity and replace <img> src with asset _id
async function processHtmlSectionImages(htmlContent: string, adminClient: any) {
  if (!htmlContent) return '';
  try {
    const dom = new JSDOM(htmlContent);
    const { document } = dom.window;
    const images = document.querySelectorAll('img');

    for (const img of Array.from(images) as any[]) {
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
        deserialize(el, next, block) {
          if (el.nodeName.toLowerCase() === 'img') {
            const src = (el as any).getAttribute ? (el as any).getAttribute('src') : null;
            if (src) {
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
    const mdMatches = text.matchAll(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g);
    for (const match of mdMatches) {
      if (match[1]) urls.add(match[1]);
    }
    
    const htmlMatches = text.matchAll(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi);
    for (const match of htmlMatches) {
      if (match[1]) urls.add(match[1]);
    }
  }

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
    const body = await request.json();
    const { action = 'create', slug, urls, url } = body;
    
    // Normalize URLs
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

    const targetUrls = urlList.slice(0, 5);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });

    const sanityToken = process.env.SANITY_API_TOKEN;
    if (!sanityToken) return NextResponse.json({ error: 'Thiếu SANITY_API_TOKEN trong file .env.local' }, { status: 500 });

    const adminClient = client.withConfig({ token: sanityToken });
    const ai = new GoogleGenAI({ apiKey });

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

    const extractedImages = extractImageUrls(successfulSources.map(s => s.text));
    const combinedContent = successfulSources
      .map((src, idx) => `=== NGUỒN ${idx + 1} (${src.url}) ===\n${src.text}`)
      .join('\n\n');

    // ==========================================
    // CASE A: SMART MERGE UPDATE EXISTING PROJECT
    // ==========================================
    if (action === 'update') {
      if (!slug) {
        return NextResponse.json({ error: 'Cần truyền slug dự án cần cập nhật' }, { status: 400 });
      }

      const existingProject = await adminClient.fetch(
        `*[_type == "project" && (slug.current == $slug || _id == $slug)][0]`,
        { slug: slug.trim() }
      );

      if (!existingProject) {
        return NextResponse.json({ error: `Không tìm thấy dự án với slug/ID '${slug}' trên Sanity CMS` }, { status: 404 });
      }

      const oldSummary = {
        title: existingProject.title,
        category: existingProject.category,
        price: existingProject.price,
        status: existingProject.status,
        location: existingProject.location,
        productCount: existingProject.productCount,
        progressPercentage: existingProject.progressPercentage,
        features: existingProject.features || []
      };

      const updatePrompt = `Bạn là Chuyên gia thẩm định & Cập nhật dữ liệu Bất Động Sản.
Website của chúng tôi đã có sẵn bài viết về dự án dưới đây. Hiện tại chúng tôi vừa thu thập được các bài báo mới cập nhật về TIẾN ĐỘ THI CÔNG, BẢNG GIÁ MỚI HOẶC CHÍNH SÁCH MỚI của dự án này.

Nhiệm vụ của bạn là: HỢP NHẤT THÔNG MINH (SMART MERGE) để làm mới bài viết dự án, cập nhật số liệu mới nhất mà vẫn bảo toàn tính nhất quán.

1. THÔNG TIN DỰ ÁN HIỆN CÓ:
${JSON.stringify(oldSummary, null, 2)}

2. DỮ LIỆU MỚI VỪA CÀO ĐƯỢC:
${combinedContent}

DANH SÁCH ẢNH TÌM THẤY TỪ CÁC NGUỒN MỚI:
${JSON.stringify(extractedImages.slice(0, 20), null, 2)}

QUY TẮC HỢP NHẤT (SMART MERGE):
1. GIỮ NGUYÊN: Tên dự án, vị trí địa lý, chủ đầu tư, quy mô tổng thể.
2. CẬP NHẬT:
   - price: Giá mới nhất (hoặc giữ nguyên nếu không đổi).
   - status: Trạng thái mới nhất.
   - progressPercentage: Phần trăm tiến độ mới (0-100).
   - progressHtml: Bài viết tiến độ thi công mới nhất dạng HTML (dùng <h3>, <p>, <ul>, <li>, chèn thẻ <img> ảnh thực tế).
   - pricingHtml: Bảng giá/CSBH cập nhật mới dạng HTML (nếu có thông tin mới, ngược lại để null).
   - featuresList: Danh sách tiện ích đầy đủ sau khi gộp.
   - newGalleryImages: Chọn 2-4 URL ảnh công trường/tiến độ mới nhất để bổ sung vào gallery.
   - updateNote: Tóm tắt 2-3 câu những điểm vừa cập nhật.

YÊU CẦU ĐẦU RA (JSON duy nhất):
{
  "title": "${existingProject.title}",
  "price": "Mức giá mới",
  "status": "Trạng thái mới",
  "progressPercentage": 75,
  "progressHtml": "Bài viết tiến độ HTML sạch",
  "pricingHtml": null,
  "featuresList": ["Tiện ích 1", "Tiện ích 2"],
  "newGalleryImages": ["URL 1", "URL 2"],
  "updateNote": "Tóm tắt thay đổi",
  "seoDescription": "Mô tả SEO mới"
}`;

      const aiUpdateResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: updatePrompt,
        config: { responseMimeType: 'application/json' }
      });

      const updateCleanText = aiUpdateResp.text?.replace(/```json/g, '').replace(/```/g, '').trim() || '{}';
      const parsedUpdate = JSON.parse(updateCleanText);

      const patchFields: any = {};
      if (parsedUpdate.price) patchFields.price = parsedUpdate.price;
      if (parsedUpdate.status) patchFields.status = parsedUpdate.status;
      if (typeof parsedUpdate.progressPercentage === 'number') patchFields.progressPercentage = parsedUpdate.progressPercentage;

      if (parsedUpdate.progressHtml) {
        const procProg = await processHtmlSectionImages(parsedUpdate.progressHtml, adminClient);
        patchFields.progressContent = convertHtmlToPortableText(procProg);
      }

      if (parsedUpdate.pricingHtml) {
        const procPrice = await processHtmlSectionImages(parsedUpdate.pricingHtml, adminClient);
        patchFields.pricingContent = convertHtmlToPortableText(procPrice);
      }

      if (Array.isArray(parsedUpdate.featuresList) && parsedUpdate.featuresList.length > 0) {
        patchFields.features = parsedUpdate.featuresList;
      }

      // Append new gallery images
      const newImagesToUpload: string[] = Array.isArray(parsedUpdate.newGalleryImages)
        ? parsedUpdate.newGalleryImages.filter((u: string) => typeof u === 'string' && u.startsWith('http'))
        : [];

      if (newImagesToUpload.length > 0) {
        const existingGallery = Array.isArray(existingProject.gallery) ? [...existingProject.gallery] : [];
        for (let i = 0; i < Math.min(newImagesToUpload.length, 4); i++) {
          try {
            const imgRes = await fetch(newImagesToUpload[i], {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            if (imgRes.ok) {
              const buffer = await imgRes.arrayBuffer();
              const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
              if (contentType.includes('image')) {
                const asset = await adminClient.assets.upload('image', Buffer.from(buffer), {
                  filename: `project-update-${Date.now()}-${i}.jpg`
                });
                existingGallery.push({
                  _type: 'image',
                  _key: Math.random().toString(36).substring(7),
                  asset: { _type: 'reference', _ref: asset._id }
                });
              }
            }
          } catch (e) {
            console.error('Error uploading update gallery image:', e);
          }
        }
        patchFields.gallery = existingGallery;
      }

      if (parsedUpdate.seoDescription) {
        patchFields.seo = {
          ...(existingProject.seo || { _type: 'seo' }),
          seoDescription: parsedUpdate.seoDescription
        };
      }

      await adminClient.patch(existingProject._id).set(patchFields).commit();

      return NextResponse.json({
        success: true,
        documentId: existingProject._id,
        title: existingProject.title,
        slug: existingProject.slug?.current || slug,
        isUpdate: true,
        updateNote: parsedUpdate.updateNote || 'Cập nhật thành công',
        studioUrl: `/admin/structure/project;${existingProject._id}`
      });
    }

    // ==========================================
    // CASE B: CREATE NEW PROJECT
    // ==========================================
    const outputFormat = `
    YÊU CẦU ĐẦU RA BẮT BUỘC (Trả về duy nhất 1 object JSON hợp lệ, không bọc markdown):
    {
      "title": "Tên thương mại dự án chuẩn SEO (Sentence case)",
      "category": "Căn hộ | Nhà phố | Biệt thự | Đất nền",
      "price": "Mức giá dự án (ví dụ: 45 - 60 triệu/m²)",
      "productCount": "Tổng số sản phẩm (ví dụ: 1200 căn)",
      "status": "Đang mở bán | Sắp ra mắt | Đã bàn giao",
      "location": "Vị trí địa lý hành chính cụ thể",
      "progressPercentage": 45,
      "excerpt": "Đoạn giới thiệu ngắn chuẩn SEO dưới 160 ký tự",
      "descriptionHtml": "Tổng quan dự án dạng HTML (Dùng h3, p, ul, li, chèn thẻ <img>. KHÔNG DÙNG H2 Ở ĐẦU).",
      "featuresList": ["Tiện ích 1", "Tiện ích 2", "Tiện ích 3"],
      "featuresHtml": "Chi tiết tiện ích dạng HTML (kèm ảnh <img>).",
      "locationHtml": "Chi tiết vị trí dạng HTML (kèm ảnh <img>).",
      "pricingHtml": "Bảng giá & CSBH dạng HTML.",
      "legalHtml": "Pháp lý dự án dạng HTML.",
      "faqs": [
        { "question": "Câu hỏi 1", "answer": "Câu trả lời 1" },
        { "question": "Câu hỏi 2", "answer": "Câu trả lời 2" }
      ],
      "selectedImages": ["URL 1", "URL 2", "URL 3", "URL 4"]
    }`;

    const prompt = `Bạn là Chuyên gia tư vấn đầu tư Bất Động Sản cao cấp.
Tổng hợp nội dung từ ${successfulSources.length} nguồn bài viết dưới đây để tạo một bài viết dự án BĐS hoàn chỉnh, 100% Unique, chuẩn SEO/AEO/GEO.

LƯU Ý QUAN TRỌNG:
1. Giao diện frontend ĐÃ CÓ thẻ <h2> cho từng tab. Các trường HTML TUYỆT ĐỐI KHÔNG DÙNG THẺ <h2> Ở ĐẦU! Chỉ dùng <h3> bên trong.
2. Hãy chèn các thẻ <img src="URL" alt="..." /> vào giữa các đoạn văn trong từng mục từ danh sách ảnh dưới đây.

DANH SÁCH ẢNH TÌM THẤY:
${JSON.stringify(extractedImages.slice(0, 25), null, 2)}

DỮ LIỆU NGUỒN TỔNG HỢP:
${combinedContent}

${outputFormat}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const aiText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!aiText) throw new Error('AI không trả về dữ liệu');

    const parsedResult = JSON.parse(aiText);

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

    const imagesToUpload: string[] = Array.isArray(parsedResult.selectedImages) && parsedResult.selectedImages.length > 0
      ? parsedResult.selectedImages.filter((u: string) => typeof u === 'string' && u.startsWith('http'))
      : extractedImages.slice(0, 6);

    const galleryAssets: any[] = [];

    for (let i = 0; i < Math.min(imagesToUpload.length, 6); i++) {
      try {
        const imgUrl = imagesToUpload[i];
        const imgRes = await fetch(imgUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
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

    const descriptionBlocks = convertHtmlToPortableText(processedDescHtml);
    const locationBlocks = convertHtmlToPortableText(processedLocHtml);
    const featuresBlocks = convertHtmlToPortableText(processedFeatHtml);
    const pricingBlocks = convertHtmlToPortableText(processedPriceHtml);
    const legalBlocks = convertHtmlToPortableText(processedLegalHtml);

    const formattedFaqs = Array.isArray(parsedResult.faqs)
      ? parsedResult.faqs.map((q: any) => ({
          _type: 'object',
          _key: Math.random().toString(36).substring(7),
          question: q.question || '',
          answer: q.answer || ''
        }))
      : [];

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
      slug: { _type: 'slug', current: slugCurrent },
      category: parsedResult.category || 'Căn hộ',
      price: parsedResult.price || '',
      productCount: parsedResult.productCount || '',
      status: parsedResult.status || 'Đang mở bán',
      location: parsedResult.location || '',
      progressPercentage: parsedResult.progressPercentage,
      excerpt: parsedResult.excerpt || '',
      description: descriptionBlocks,
      locationContent: locationBlocks,
      features: Array.isArray(parsedResult.featuresList) ? parsedResult.featuresList : [],
      featuresContent: featuresBlocks,
      pricingContent: pricingBlocks,
      legalContent: legalBlocks,
      faqs: formattedFaqs,
    };

    if (galleryAssets.length > 0) {
      doc.imageUrl = galleryAssets[0];
      doc.gallery = galleryAssets;
    }

    const createdDoc = await adminClient.create(doc);

    return NextResponse.json({
      success: true,
      documentId: createdDoc._id,
      title: createdDoc.title,
      slug: slugCurrent,
      sourcesCount: successfulSources.length,
      imagesUploaded: galleryAssets.length,
      studioUrl: `/admin/structure/project;${createdDoc._id}`
    });

  } catch (error: any) {
    console.error('AI Project Writer error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý dự án bằng AI' }, { status: 500 });
  }
}
