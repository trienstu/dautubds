import React from 'react';

export default function ConsultantSidebar({ consultant }: { consultant: any }) {
  if (!consultant) return null;

  return (
    <div style={{ background: 'var(--color-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div style={{ background: 'var(--color-primary)', color: 'var(--color-dark)', padding: '0.8rem 1.5rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>👑 Chuyên viên tư vấn</span>
        <span style={{ fontSize: '0.8rem', background: 'var(--color-dark)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Độc quyền</span>
      </div>
      
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <img 
            src={consultant.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a'} 
            alt={consultant.name} 
            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} 
          />
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground)' }}>
              {consultant.name}
              {consultant.isVerified && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#1877F2"/>
                  <path d="M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white"/>
                </svg>
              )}
            </h3>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Chuyên gia BĐS Cao cấp</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--background)', padding: '0.8rem 0.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>⭐ 5.0</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(124 đánh giá)</div>
          </div>
          <div style={{ background: 'var(--background)', padding: '0.8rem 0.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1.1rem' }}>8</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Năm K.Nghiệm</div>
          </div>
          <div style={{ background: 'var(--background)', padding: '0.8rem 0.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#2196F3', fontWeight: 'bold', fontSize: '1.1rem' }}>100+</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Giao dịch</div>
          </div>
        </div>

        <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--color-primary)', borderRadius: '8px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '1px', marginBottom: '0.5rem' }}>Hotline 24/7</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--foreground)' }}>{consultant.phone || '0909 999 888'}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <a href={`tel:${consultant.phone ? consultant.phone.replace(/[^0-9]/g, '') : '0909999888'}`} className="btn" style={{ padding: '0.8rem', textAlign: 'center', background: '#F44336', color: 'white', border: 'none', borderRadius: '4px' }}>
            📞 Gọi Ngay
          </a>
          <a href={consultant.zaloUrl || '#'} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.8rem', textAlign: 'center', background: '#0088FF', color: 'white', border: 'none', borderRadius: '4px' }}>
            💬 Chat Zalo
          </a>
          <a href={`mailto:${consultant.email || 'contact@example.com'}`} className="btn" style={{ padding: '0.8rem', textAlign: 'center', background: 'var(--color-primary)', color: 'var(--color-dark)', border: 'none', borderRadius: '4px' }}>
            ✉️ Gửi Email
          </a>
          <a href={consultant.facebookUrl || '#'} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.8rem', textAlign: 'center', background: '#1877F2', color: 'white', border: 'none', borderRadius: '4px' }}>
            🔵 Facebook
          </a>
        </div>
        
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground)' }}>
            💬 Khách hàng nói gì?
          </h4>
          <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            "Chuyên viên làm việc rất chuyên nghiệp, hỗ trợ nhiệt tình cả sau khi giao dịch thành công. Rất đáng tin cậy!"
          </p>
          <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>- Anh Trần V. Hải (CEO)</div>
        </div>
      </div>
    </div>
  );
}
