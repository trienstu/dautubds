'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isProjectDetail = pathname?.startsWith('/du-an/');

  // Determine positions using exact px to match FloatingContact.module.css (bottom: 30px, gap: 15px, size: 55px)
  // Contact widget height = 55 (phone) + 15 (gap) + 55 (zalo) = 125px. Starts at bottom 30px.
  // Top of Contact widget is at 30 + 125 = 155px.
  
  // If not project detail, chatbot starts at 155 + 15 = 170px. Scroll to top at 170 + 55 + 15 = 240px.
  // If project detail, chatbot starts at 30px. Scroll to top at 30 + 55 + 15 = 100px.
  
  const desktopScrollBottom = isProjectDetail ? '100px' : '240px';
  const mobileChatbotBottom = isProjectDetail ? '30px' : '170px';
  const mobileScrollBottom = isProjectDetail ? '100px' : '240px';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Xin chào! 👋 Cảm ơn bạn đã liên hệ. Tôi sẽ hỗ trợ bạn ngay ạ! Bạn cần tư vấn về vấn đề gì?'
    }
  ]);

  const quickReplies = [
    'Tôi muốn biết giá dự án',
    'Tôi muốn xem nhà mẫu',
    'Đặt lịch tham quan dự án',
    'Hỏi về chính sách thanh toán',
    'Yêu cầu gọi lại cho tôi'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response based on rules
    setTimeout(() => {
      let botResponse = 'Dạ vâng, chuyên viên tư vấn của chúng tôi sẽ liên hệ hỗ trợ bạn ngay ạ. Bạn vui lòng để lại số điện thoại hoặc Zalo nhé!';
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('giá') || lowerText.includes('bảng giá')) {
        botResponse = 'Dạ, rổ hàng và bảng giá chi tiết tuỳ thuộc vào vị trí và loại căn. Anh/Chị vui lòng để lại SĐT hoặc kết nối Zalo để em gửi file báo giá chính xác nhất nhé!';
      } else if (lowerText.includes('nhà mẫu') || lowerText.includes('tham quan')) {
        botResponse = 'Dạ, nhà mẫu đang mở cửa đón khách tham quan hàng ngày. Anh/Chị cho em xin SĐT để em đăng ký vé tham quan VIP cho mình nhé!';
      } else if (lowerText.includes('thanh toán') || lowerText.includes('chính sách')) {
        botResponse = 'Dạ, hiện tại dự án đang có chính sách thanh toán giãn tiến độ cực kỳ tốt và chiết khấu cao. Anh/Chị kết nối Zalo để em gửi chi tiết bảng tính dòng tiền nhé!';
      } else if (lowerText.includes('gọi')) {
        botResponse = 'Dạ, anh/chị vui lòng nhập số điện thoại, bộ phận CSKH sẽ gọi lại hỗ trợ anh/chị ngay ạ!';
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <style>{`
        /* Desktop */
        @media (min-width: 769px) {
          .floating-chatbot-btn, .floating-chatbot-window {
            display: none !important;
          }
          .floating-scroll-top {
            bottom: ${desktopScrollBottom} !important;
          }
        }
        /* Mobile */
        @media (max-width: 768px) {
          .floating-chatbot-btn, .floating-chatbot-window {
            bottom: ${mobileChatbotBottom} !important;
            right: 30px !important;
          }
          .floating-scroll-top {
            bottom: ${mobileScrollBottom} !important;
            right: 35px !important;
          }
        }
      `}</style>
      {/* Scroll to Top Button */}
      {!isOpen && showScrollTop && (
        <button
          className="floating-scroll-top"
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: desktopScrollBottom,
            right: '35px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'var(--color-secondary)',
            color: 'var(--foreground)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 9999,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          className="floating-chatbot-btn"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: isProjectDetail ? '30px' : '170px',
            right: '30px',
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: 'var(--color-dark)',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 9999,
            transition: 'transform 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="floating-chatbot-window"
          style={{
            position: 'fixed',
            bottom: '2rem',
          right: '2rem',
          width: '360px',
          maxWidth: 'calc(100vw - 2rem)',
          height: '600px',
          maxHeight: 'calc(100vh - 4rem)',
          background: 'var(--background)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--color-dark-light)',
            padding: '1.2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid var(--color-dark-light)' }}></div>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--foreground)', fontWeight: 600 }}>Tư vấn viên AI</h3>
                <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'rgba(0,0,0,0.2)'
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--color-dark-light)',
                  color: msg.sender === 'user' ? 'var(--color-dark)' : 'var(--foreground)',
                  padding: '0.8rem 1rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'var(--color-dark-light)',
                padding: '0.8rem 1rem',
                borderRadius: '16px 16px 16px 4px',
                display: 'flex',
                gap: '0.3rem',
                alignItems: 'center',
                height: '42px'
              }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--color-text-muted)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both' }}></span>
                <span style={{ width: '6px', height: '6px', background: 'var(--color-text-muted)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                <span style={{ width: '6px', height: '6px', background: 'var(--color-text-muted)', borderRadius: '50%', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                <style>{`
                  @keyframes typing {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                  }
                `}</style>
              </div>
            )}
            
            {/* Quick Replies */}
            {messages.length === 1 && !isTyping && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--color-text)',
                      padding: '0.8rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '1rem',
            background: 'var(--background)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1,
                background: 'var(--color-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--foreground)',
                padding: '0.8rem 1rem',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim()}
              style={{
                background: inputValue.trim() ? 'var(--color-primary)' : 'var(--color-dark-light)',
                color: inputValue.trim() ? 'var(--color-dark)' : 'var(--color-text-muted)',
                border: 'none',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
