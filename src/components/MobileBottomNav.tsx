'use client';

import React from 'react';

export default function MobileBottomNav({ consultant }: { consultant: any }) {
  if (!consultant) return null;

  return (
    <div className="mobile-flex" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #eaeaea',
      zIndex: 9999,
      display: 'none', // Sẽ được override bởi Media Query
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.8rem 0',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      <a href={`tel:${consultant.phone ? consultant.phone.replace(/[^0-9]/g, '') : '0909999888'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#4CAF50', flex: 1 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Gọi điện</span>
      </a>

      <a href={consultant.zaloUrl || '#'} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#0088FF', flex: 1, borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Zalo</span>
      </a>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#F44336', flex: 1, cursor: 'pointer' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Đặt lịch</span>
      </div>
    </div>
  );
}
