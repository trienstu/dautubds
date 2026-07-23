'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function NewsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    
    startTransition(() => {
      router.push(`/tin-tuc?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px', margin: '0 auto 3rem auto', position: 'relative' }}>
      <input
        type="text"
        placeholder="Tìm kiếm tin tức, sự kiện..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          flex: 1,
          padding: '12px 20px',
          borderRadius: '30px',
          border: '1px solid var(--border-color)',
          background: 'var(--color-dark-light)',
          color: 'var(--color-text)',
          fontSize: '1rem',
          outline: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      />
      <button 
        type="submit" 
        disabled={isPending}
        style={{
          padding: '12px 24px',
          borderRadius: '30px',
          background: 'var(--color-primary)',
          color: 'var(--color-dark)',
          fontWeight: 600,
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.7 : 1,
          transition: 'all 0.2s',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
        onMouseOver={(e) => { if (!isPending) e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseOut={(e) => { if (!isPending) e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {isPending ? 'Đang tìm...' : 'Tìm kiếm'}
      </button>
    </form>
  );
}
