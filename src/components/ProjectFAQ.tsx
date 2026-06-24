'use client';

import React, { useState } from 'react';

export default function ProjectFAQ({ faqs }: { faqs: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div id="hoi-dap" style={{ marginTop: '4rem', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--color-primary)', fontWeight: 700, borderBottom: '2px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', display: 'inline-block' }}>
        Câu Hỏi Thường Gặp (Q&A)
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            style={{ 
              background: 'var(--color-secondary)', 
              borderRadius: '8px', 
              border: `1px solid ${openIndex === idx ? 'var(--color-primary)' : 'var(--border-color)'}`,
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <button
              aria-expanded={openIndex === idx}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.2rem 1.5rem',
                background: 'transparent',
                border: 'none',
                color: openIndex === idx ? 'var(--color-primary)' : 'var(--foreground)',
                fontSize: '1.1rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <span>{faq.question}</span>
              <svg 
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{
                  transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s ease',
                  flexShrink: 0,
                  marginLeft: '1rem'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div
              style={{
                maxHeight: openIndex === idx ? '1000px' : '0',
                opacity: openIndex === idx ? 1 : 0,
                transition: 'all 0.3s ease-in-out',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--color-text)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
