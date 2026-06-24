import React from 'react';

export default function ConsultantCardMobile({ consultant }: { consultant: any }) {
  if (!consultant) return null;

  return (
    <div className="mobile-only" style={{ background: '#FFFAEC', border: '1px solid #E5C158', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', display: 'none' }}>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center', color: '#333' }}>
        Chuyên Viên Tư Vấn
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={consultant.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a'} 
            alt={consultant.name} 
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5C158' }} 
          />
          <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#F44336', borderRadius: '50%', padding: '2px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: '#111', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {consultant.name}
            {consultant.isVerified && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#1877F2"/>
                <path d="M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white"/>
              </svg>
            )}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', background: '#D32F2F', color: 'white', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>Độc quyền</span>
            <span style={{ fontSize: '0.8rem', color: '#555', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#FFC107', marginRight: '2px' }}>★</span> 5.0 (124)
            </span>
          </div>
          {consultant.isVerified && (
             <div style={{ fontSize: '0.75rem', color: '#2E7D32', border: '1px solid #2E7D32', padding: '0.1rem 0.4rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.4rem' }}>
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã xác minh
             </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a aria-label="Liên hệ Zalo" href={consultant.zaloUrl || '#'} target="_blank" rel="noreferrer" style={{ width: '40px', height: '40px', background: '#0066CC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </a>
          <a aria-label="Gọi điện thoại" href={`tel:${consultant.phone ? consultant.phone.replace(/[^0-9]/g, '') : '0909999888'}`} style={{ width: '40px', height: '40px', background: '#2E7D32', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
