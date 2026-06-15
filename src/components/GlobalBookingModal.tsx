'use client';

import React, { useState, useEffect } from 'react';

export default function GlobalBookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e.detail) setProjectName(e.detail);
      setIsOpen(true);
      setStatus('idle');
    };

    window.addEventListener('open-booking', handleOpen);
    return () => window.removeEventListener('open-booking', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const formData = new FormData(e.currentTarget);
    
    // Yêu cầu bắt buộc của Web3Forms
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE");
    formData.append("subject", `Yêu cầu Đặt lịch xem dự án: ${projectName}`);
    formData.append("Dự án quan tâm", projectName);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '1rem' }}>
      <div style={{ background: 'var(--color-secondary)', width: '100%', maxWidth: '450px', borderRadius: '12px', padding: '2rem', position: 'relative', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        {/* Nút tắt */}
        <button 
          onClick={() => setIsOpen(false)}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          &times;
        </button>

        <h3 style={{ fontSize: '1.4rem', color: 'var(--foreground)', marginBottom: '0.5rem', textAlign: 'center' }}>Đăng Ký Đặt Lịch</h3>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {projectName ? `Tham quan dự án ${projectName}` : 'Để lại thông tin để chúng tôi hỗ trợ bạn'}
        </p>

        {status === 'success' ? (
          <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: 600 }}>Gửi yêu cầu thành công!</div>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>Họ và tên *</label>
              <input type="text" name="name" required placeholder="Nhập họ tên của bạn" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>Số điện thoại *</label>
              <input type="tel" name="phone" required placeholder="Nhập số điện thoại" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>Email</label>
              <input type="email" name="email" placeholder="Nhập email (Không bắt buộc)" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '1rem' }} />
            </div>

            {status === 'error' && (
              <div style={{ color: '#F44336', fontSize: '0.85rem', textAlign: 'center' }}>
                Có lỗi xảy ra, vui lòng thử lại sau!
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              style={{ width: '100%', padding: '1rem', background: 'var(--color-primary)', color: 'var(--color-dark)', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '1.05rem', marginTop: '0.5rem', cursor: status === 'submitting' ? 'not-allowed' : 'pointer', opacity: status === 'submitting' ? 0.7 : 1 }}
            >
              {status === 'submitting' ? 'Đang gửi...' : 'GỬI YÊU CẦU NGAY'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
