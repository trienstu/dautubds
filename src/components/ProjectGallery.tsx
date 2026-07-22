'use client';

import { useState } from 'react';

export default function ProjectGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div>
      <style>{`
        .gallery-thumbs::-webkit-scrollbar { height: 6px; }
        .gallery-thumbs::-webkit-scrollbar-track { background: var(--color-dark-light); border-radius: 4px; }
        .gallery-thumbs::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        .gallery-thumbs::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '700px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#121212' }}>
        <img 
          src={images[currentIndex]} 
          alt={`Gallery ${currentIndex + 1}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }} 
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', zIndex: 10, transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            >
              &#10094;
            </button>
            <button 
              onClick={nextImage} 
              style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', zIndex: 10, transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            >
              &#10095;
            </button>
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, zIndex: 10 }}>
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--foreground)' }}>Thư viện phương tiện</h3>
            <span style={{ background: 'var(--color-dark-light)', color: 'var(--color-text-muted)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500 }}>
              {images.length} items
            </span>
          </div>
          
          <div className="gallery-thumbs" style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.8rem', scrollBehavior: 'smooth' }}>
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className="no-lightbox thumb-img"
                onClick={() => setCurrentIndex(idx)}
                style={{ 
                  width: '120px', 
                  height: '80px', 
                  flexShrink: 0, 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  border: currentIndex === idx ? '2px solid #3b82f6' : '2px solid transparent',
                  opacity: currentIndex === idx ? 1 : 0.6,
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                onMouseOut={(e) => { if (currentIndex !== idx) e.currentTarget.style.opacity = '0.6' }}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="no-lightbox" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
