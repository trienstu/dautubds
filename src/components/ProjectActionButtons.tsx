'use client';

import React from 'react';

export default function ProjectActionButtons({ projectTitle }: { projectTitle: string }) {
  const openBookingModal = () => {
    window.dispatchEvent(new CustomEvent('open-booking', { detail: projectTitle }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <button 
        style={{ background: '#2563EB', color: 'white', padding: '0.8rem', borderRadius: '6px', fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.3s', cursor: 'pointer' }}
        onClick={openBookingModal}
      >
        📞 Liên hệ tư vấn
      </button>
      <button 
        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--foreground)', padding: '0.8rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'border-color 0.3s', cursor: 'pointer' }}
        onClick={openBookingModal}
      >
        📅 Đặt lịch xem
      </button>
    </div>
  );
}
