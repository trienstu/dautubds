'use client';

import { useState } from 'react';
import Link from 'next/link';
import { replaceDateShortcodes } from '@/utils/dateReplace';

export default function ProjectNews({ news }: { news: any[] }) {
  const [showAll, setShowAll] = useState(false);
  
  if (!news || news.length === 0) return null;
  
  const displayedNews = showAll ? news : news.slice(0, 3);
  
  return (
    <div style={{ margin: '3rem 0', background: 'var(--color-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>Tin tức về dự án</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayedNews.map((item: any) => (
          <Link key={item.id} href={`/tin-tuc/${item.slug}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <img src={item.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} alt={item.title} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', color: 'var(--foreground)', lineHeight: 1.4, fontWeight: 600 }}>{replaceDateShortcodes(item.title)}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(item.date).toLocaleDateString('vi-VN')}</p>
            </div>
          </Link>
        ))}
      </div>
      {news.length > 3 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            onClick={() => setShowAll(!showAll)}
            style={{ padding: '0.5rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.3s' }}
          >
            {showAll ? 'Thu gọn' : `Xem thêm (${news.length - 3}) bài viết`}
          </button>
        </div>
      )}
    </div>
  );
}
