import { NextResponse } from 'next/server';
import { client } from '../../../../sanity/lib/client';
import { GoogleGenAI } from '@google/genai';
import { htmlToBlocks } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';
import { JSDOM } from 'jsdom';

export const maxDuration = 60; // Tăng tối đa thời gian thực thi (60 giây cho gói Hobby)

export async function POST(request: Request) {
  try {
    const { url, type, data, formula, angle } = await request.json();
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
      "title": "Tiêu đề bài viết chuẩn SEO. Tuyệt đối KHÔNG viết hoa từng chữ cái đầu (Title Case), mà hãy viết hoa chữ cái đầu câu bình thường (Sentence case). Phải chứa từ khóa (keyword) có trong chủ đề gốc.",
      "excerpt": "Đoạn mô tả ngắn gọn (meta description) chuẩn SEO dưới 160 ký tự, chứa từ khóa chính.",
      "content": "Nội dung bài viết định dạng HTML (<h2>, <h3>, <p>, <ul>, <li>, <table>, <img>). Các thẻ heading (h2, h3) cũng BẮT BUỘC phải viết hoa dạng Sentence case (chỉ viết hoa chữ đầu câu). Phải phân bổ từ khóa tự nhiên. Giữ lại các thẻ <img src='...'> nếu có.",
      "imageUrl": "Tìm trong markdown gốc xem có URL ảnh chính nào không, nếu có hãy trích xuất ra đây để tôi dùng làm thumbnail. Nếu không có, để rỗng."
    }`;

    // Xây dựng hướng dẫn công thức bài viết (14 công thức & tâm lý học BĐS)
    let formulaGuide = "";
    if (formula === "pas") {
      formulaGuide = `CÔNG THỨC ÁP DỤNG: PAS (Problem - Agitate - Solve)
- P (Problem - Nỗi đau): Mở đầu bằng nỗi đau/băn khoăn lớn nhất của người mua hoặc nhà đầu tư BĐS trong bối cảnh hiện tại.
- A (Agitate - Đào sâu tác động): Phân tích chi phí cơ hội và rủi ro nếu chần chừ hoặc chọn sai (lãi suất thả nổi, chôn vốn, chậm tiến độ, trượt giá tài sản).
- S (Solve - Giải pháp): Đưa ra các giải pháp chọn lọc BĐS an toàn, có dòng tiền và tiềm năng tăng trưởng bền vững.`;
    } else if (formula === "pppp") {
      formulaGuide = `CÔNG THỨC ÁP DỤNG: PPPP (Picture - Promise - Prove - Push)
- Picture: Khắc họa bức tranh không gian sống lý tưởng hoặc tiềm năng tăng giá đột phá khi hạ tầng hoàn thành.
- Promise: Khẳng định cam kết về chất lượng, tỷ suất cho thuê và biên độ sinh lời thực tế.
- Prove: Dẫn chứng số liệu thị trường, tiến độ thi công, pháp lý minh bạch và uy tín chủ đầu tư.
- Push: Kêu gọi hành động nắm bắt cơ hội ở giai đoạn vàng đầu tiên.`;
    } else if (formula === "aida") {
      formulaGuide = `CÔNG THỨC ÁP DỤNG: AIDA (Attention - Interest - Desire - Action)
- Attention: Mở bài giật tít số liệu hoặc nghịch lý thị trường thu hút người đọc dừng lướt.
- Interest: Đào sâu thông tin quy hoạch, hạ tầng liên vùng và các yếu tố tạo động lực tăng giá.
- Desire: Kích thích mong muốn sở hữu căn hộ/bất động sản chuẩn sống resort hoặc BĐS dòng tiền.
- Action: Định hướng các bước thẩm định pháp lý và đưa ra quyết định xuống tiền đúng thời điểm.`;
    } else if (formula === "storytelling") {
      formulaGuide = `CÔNG THỨC ÁP DỤNG: Storytelling (Kể chuyện & Bài học kinh nghiệm)
- Mở đầu bằng câu chuyện thực tế hoặc diễn biến thị trường BĐS.
- Đi qua các bước ngoặt về thay đổi hạ tầng, chính sách pháp lý và khẩu vị của nhà đầu tư.
- Đúc kết bài học đắt giá và cơ hội mới cho người mua nhà và nhà đầu tư thông thái.`;
    } else if (formula === "4cs") {
      formulaGuide = `CÔNG THỨC ÁP DỤNG: 4Cs (Clear - Concise - Compelling - Credible)
- Clear: Thông điệp sáng rõ, mạch lạc, không dùng thuật ngữ sáo rỗng.
- Concise: Ngắn gọn, súc tích, mỗi đoạn tối đa 3 câu.
- Compelling: Lập luận sắc bén về lợi nhuận, an toàn vốn và phong cách sống.
- Credible: Trích dẫn số liệu thị trường, bảng biểu và văn bản quy hoạch cụ thể.`;
    } else {
      formulaGuide = `CÔNG THỨC ÁP DỤNG: Tự Động Tối Ưu (Ưu tiên PAS cho bài phân tích thị trường/rủi ro, PPPP cho bài cơ hội đầu tư/bán hàng, hoặc Storytelling cho bài xu hướng).`;
    }

    let angleGuide = "";
    if (angle === "investment_advice") {
      angleGuide = "GÓC TIẾP CẬN: Lời khuyên đầu tư & Tối ưu dòng tiền (Tập trung bài toán vốn, đòn bẩy ngân hàng, tỷ suất cho thuê và biên độ tăng giá dài hạn).";
    } else if (angle === "legal_alert") {
      angleGuide = "GÓC TIẾP CẬN: Cảnh báo rủi ro & Thẩm định pháp lý (Tập trung tính pháp lý, quy hoạch 1/500, giấy phép xây dựng, thời gian cấp sổ hồng và rủi ro mua nhà trên giấy).";
    } else if (angle === "buyer_guide") {
      angleGuide = "GÓC TIẾP CẬN: Cẩm nang an cư cho người mua nhà (Tập trung không gian sống xanh, tiện ích nội ngoại khu, trường học, bệnh viện, lộ trình di chuyển và chi phí quản lý vận hành).";
    } else {
      angleGuide = "GÓC TIẾP CẬN: Chuyên gia thẩm định & Phân tích thị trường Bất Động Sản cao cấp (Khách quan, đa chiều, giàu dữ liệu thực chứng).";
    }

    if (mode === 'url') {
      prompt = `Bạn là Chuyên gia phân tích thị trường Bất Động Sản cao cấp kiêm Tổng biên tập kỳ cựu.
Hãy viết lại bài viết sau thành một bài phân tích BĐS chuyên sâu, độc bản (unique 100%), chuẩn SEO/AEO/GEO cao nhất, loại bỏ hoàn toàn các câu văn sáo rỗng của bot AI.

==================================================
BÀI VIẾT NGUỒN:
${sourceContent}

${outputFormat}`;
    } else {
      prompt = `Bạn là Chuyên gia tư vấn đầu tư Bất Động Sản cao cấp kiêm Nhà báo phân tích kinh tế kỳ cựu.
Hãy tự động tìm kiếm thông tin mới nhất trên mạng Internet (năm 2025-2026) và biên soạn một bài phân tích BĐS chuyên sâu, độc bản (100% unique), đạt điểm tuyệt đối về SEO, AEO và GEO.

==================================================
CHỦ ĐỀ YÊU CẦU:
${input}

${formulaGuide}
${angleGuide}

==================================================
BỘ QUY CHUẨN NỘI DUNG BẤT ĐỘNG SẢN CAO CẤP (ANTI-WORKFLOW PRESET):
1. ĐÁNH TRÚNG TÂM LÝ & NỖI ĐAU THẬT CỦA KHÁCH HÀNG:
   - Nỗi sợ mua dự án trên giấy chậm tiến độ hoặc chủ đầu tư thiếu hụt dòng tiền.
   - Nỗi sợ pháp lý không minh bạch, chậm ra sổ hồng.
   - Nỗi sợ mua đỉnh khi chưa rõ chu kỳ thị trường.
   - Áp lực lãi suất vay ngân hàng thả nổi và bài toán chi phí cơ hội.
2. TỪ VỰNG THỰC CHIẾN CỦA NHÀ ĐẦU TƯ:
   - Dùng đúng các thuật ngữ: "sổ hồng riêng", "thanh khoản", "BĐS dòng tiền", "tỷ suất cho thuê", "vị trí đắc địa", "tiềm năng tăng giá", "hạ tầng kết nối", "quy hoạch 1/500", "ân hạn nợ gốc".
3. ĐÒN BẨY TÂM LÝ & NLP:
   - Authority: Dẫn chứng số liệu thị trường thực, các mốc quy hoạch hạ tầng rõ ràng.
   - Cost of Inaction: Phân tích cái giá của sự chần chừ khi các nhịp sóng hạ tầng đang tăng tốc.
   - Anchoring: So sánh mặt bằng giá khu vực lân cận để làm nổi bật dư địa tăng trưởng.
4. TIÊU CHUẨN VIET-CONTENT-SEO-GEO-V5:
   - Mở bài có Direct Answer (40-50 từ) trả lời trực tiếp câu hỏi thị trường để Google hiển thị Featured Snippet.
   - Heading (h2, h3) viết dạng Sentence case (chỉ viết hoa chữ cái đầu câu và tên riêng).
   - Đoạn văn ngắn gọn, tối đa 3 câu/đoạn để dễ đọc trên smartphone.
   - Có ít nhất 1 bảng biểu so sánh (HTML <table>) hoặc danh sách bullet (<ul><li>) thống kê số liệu.
   - TUYỆT ĐỐI CẤM văn mẫu bot: "Không chỉ... mà còn...", "Đóng vai trò quan trọng", "Bức tranh toàn cảnh", "Hứa hẹn sẽ là", "Hãy cùng chúng tôi khám phá".

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
        console.error('Failed to upload thumbnail', err);
      }
    }

    // 4. Pre-process in-content images (Download & Upload to Sanity)
    const dom = new JSDOM(result.content);
    const document = dom.window.document;
    const images = Array.from(document.querySelectorAll('img'));
    
    for (const img of images as any[]) {
      const src = img.getAttribute('src');
      if (src && src.startsWith('http')) {
        try {
          const imgRes = await fetch(src);
          const buffer = await imgRes.arrayBuffer();
          const asset = await adminClient.assets.upload('image', Buffer.from(buffer), {
            filename: `content-img-${Date.now()}.jpg`
          });
          // Replace src with the Sanity Asset ID so htmlToBlocks can pick it up
          img.setAttribute('src', asset._id);
        } catch (err) {
          console.error(`Failed to upload in-content image: ${src}`, err);
          img.remove(); // Remove broken images
        }
      }
    }
    
    let processedHtml = document.body.innerHTML;
    if (mode === 'url') {
      processedHtml += `\n<p><em>Nguồn tham khảo: <a href="${input}" target="_blank" rel="nofollow noopener noreferrer">${input}</a></em></p>`;
    }

    // 5. Convert HTML to Sanity Portable Text Blocks
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
          name: 'blogPost',
          fields: [{ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'table' }, { type: 'image' }] }],
        },
      ],
    });
    const blockContentType = defaultSchema.get('blogPost').fields.find((f: any) => f.name === 'body').type;
    
    const blocks = htmlToBlocks(processedHtml, blockContentType, {
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

    // 6. Create Draft Document in Sanity
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
