'use client';

import { useState, useEffect } from 'react';

export default function ImageLightbox({ children }: { children: React.ReactNode }) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        
        // Skip small icons, logos, or elements explicitly opted out
        if (
          img.naturalWidth > 150 || 
          img.naturalHeight > 150 || 
          img.width > 150 || 
          img.height > 150
        ) {
          if (
            !img.closest('.no-lightbox') && 
            !img.closest('.gallery-thumbs') && 
            !img.closest('.thumb-img') && 
            !img.closest('a[href]')
          ) {
            setActiveImage(img.src);
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveImage(null);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (activeImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [activeImage]);

  return (
    <>
      {children}

      {activeImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setActiveImage(null)}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes zoomIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>

          <button
            onClick={() => setActiveImage(null)}
            title="Đóng (Esc)"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000000,
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>

          <img
            src={activeImage}
            alt="Hình ảnh phóng to"
            style={{
              maxWidth: '92vw',
              maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              animation: 'zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
