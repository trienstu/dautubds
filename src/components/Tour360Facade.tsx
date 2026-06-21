'use client';

import React, { useState } from 'react';

export default function Tour360Facade({ url, title, imageUrl }: { url: string, title: string, imageUrl?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <iframe 
        className="responsive-tour-iframe" 
        src={url} 
        allowFullScreen 
        loading="lazy" 
        title={`Tour 360 ${title}`}
      ></iframe>
    );
  }

  return (
    <div 
      className="responsive-tour-iframe"
      style={{
        position: 'relative',
        cursor: 'pointer',
        background: 'var(--color-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => setIsLoaded(true)}
    >
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '8px'
      }}></div>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        color: 'white',
        zIndex: 2
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.5px' }}>Bấm để khám phá Tour 360°</span>
      </div>
    </div>
  );
}
