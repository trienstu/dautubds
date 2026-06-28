import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { client } from '../../../../sanity/lib/client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
    }

    // 1. Fetch project data from Sanity to feed the AI
    const projects = await client.fetch(`*[_type == "project"] {
      title, 
      "slug": slug.current, 
      location, 
      price, 
      status
    }`);

    const projectContext = projects.map((p: any) => 
      `- ${p.title} (${p.slug}): Giá ${p.price || 'Đang cập nhật'}, Vị trí: ${p.location}, Trạng thái: ${p.status}`
    ).join('\n');

    // 2. Prepare the System Prompt
    const systemInstruction = `
    Bạn là một chuyên viên tư vấn bất động sản chuyên nghiệp, nhiệt tình và lịch sự của website Đầu Tư BĐS.
    Nhiệm vụ của bạn là tư vấn cho khách hàng dựa trên danh sách dự án sau đây:
    ${projectContext}
    
    NGỮ CẢNH HIỆN TẠI: 
    Khách hàng đang xem đường dẫn: ${context || 'Trang chủ'}
    Nếu khách hàng hỏi "dự án này", "dự án ở đây", hãy hiểu là họ đang hỏi về dự án có tên miền trùng với URL trên (ví dụ /du-an/monrei-saigon thì là dự án Monrei Saigon).

    MỤC TIÊU QUAN TRỌNG NHẤT:
    Hãy tư vấn ngắn gọn, súc tích (dưới 100 chữ). 
    Hãy luôn khéo léo xin số điện thoại hoặc Zalo của khách hàng để chuyên viên có thể tư vấn chuyên sâu hơn.
    Ví dụ: "Dạ, để em gửi bảng tính dòng tiền chi tiết cho mình, anh/chị cho em xin số điện thoại/Zalo nhé ạ."
    
    LƯU Ý: Không tự bịa thông tin nếu không có trong dữ liệu.
    `;

    // 3. Detect Phone Number from the latest user message
    const latestUserMessage = messages[messages.length - 1]?.text || '';
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
    const foundPhones = latestUserMessage.replace(/\s|\./g, '').match(phoneRegex);

    if (foundPhones && foundPhones.length > 0) {
      const phone = foundPhones[0];
      
      // Send to Telegram
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const text = `🚨 BÁO ĐỘNG TING TING 🚨\n\nCó khách hàng mới để lại thông tin từ Chatbot AI!\n- SĐT: ${phone}\n- Đang xem trang: ${context}\n- Tin nhắn khách: "${latestUserMessage}"`;
        
        const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: text,
          }),
        }).catch(err => {
          console.error('Telegram Error:', err);
          return null;
        });
        
        if (telegramRes) {
          console.log('Telegram API Response:', await telegramRes.json());
        }
      }
    }

    // 4. Connect to Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction 
    });

    let formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    // Gemini requires history to start with a 'user' message
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(latestUserMessage);
    const response = await result.response;
    const aiText = response.text();

    return NextResponse.json({ message: aiText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống máy chủ AI' }, { status: 500 });
  }
}
