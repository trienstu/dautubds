'use client';

import React, { useState } from 'react';
import styles from '../lien-he/page.module.css';

export default function AiToolsPage() {
  const [mode, setMode] = useState<'url' | 'topic'>('url');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: mode, data: inputValue })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem', textAlign: 'center' }}>
          AI Content Auto-Writer
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
          Dán link bài viết gốc hoặc nhập chủ đề bất kỳ. AI sẽ tự động phân tích, tìm kiếm thông tin và tạo thành bản nháp chuẩn SEO trên Sanity.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button 
            onClick={() => { setMode('url'); setInputValue(''); }}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 600, border: mode === 'url' ? 'none' : '1px solid var(--border-color)', background: mode === 'url' ? 'var(--color-primary)' : 'transparent', color: mode === 'url' ? '#111' : 'var(--color-text)' }}
          >
            🔗 Viết lại từ Link (URL)
          </button>
          <button 
            onClick={() => { setMode('topic'); setInputValue(''); }}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 600, border: mode === 'topic' ? 'none' : '1px solid var(--border-color)', background: mode === 'topic' ? 'var(--color-primary)' : 'transparent', color: mode === 'topic' ? '#111' : 'var(--color-text)' }}
          >
            💡 Sáng tạo từ Chủ đề
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-dark-light)', padding: '2rem', borderRadius: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {mode === 'url' ? 'URL Bài viết nguồn' : 'Chủ đề / Yêu cầu viết bài'}
            </label>
            {mode === 'url' ? (
              <input 
                type="url" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://vnexpress.net/..." 
                required
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)' }}
              />
            ) : (
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ví dụ: Đánh giá tiềm năng đầu tư dự án The Privé Khang Điền tại Bình Tân..." 
                required
                rows={4}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', resize: 'vertical' }}
              />
            )}
          </div>
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Đang gọi AI xào bài (Mất khoảng 15-30s)...' : '🚀 Chạy AI Viết Bài'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
            <strong>Lỗi:</strong> {error}
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Lưu ý: Bạn cần phải cấu hình <strong>GEMINI_API_KEY</strong> và <strong>SANITY_API_TOKEN</strong> trong file .env.local thì tính năng này mới hoạt động toàn diện.</p>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#22c55e', fontSize: '1.5rem', marginBottom: '1rem' }}>🎉 Hoàn tất xào bài!</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>
              Bài viết đã được AI viết lại thành công và lưu dưới dạng Bản Nháp (Draft). Hãy bấm vào link bên dưới để chuyển sang giao diện Sanity kiểm tra và Xuất bản nhé!
            </p>
            <a href={result.studioUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-block' }}>
              📝 Mở bài viết trong Sanity Studio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
