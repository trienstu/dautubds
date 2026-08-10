'use client';

import React, { useState } from 'react';

export default function AiToolsPage() {
  const [mode, setMode] = useState<'url' | 'topic' | 'project'>('project');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '211291') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mật khẩu không chính xác!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let endpoint = '/api/ai-writer';
      let payload: any = {};

      if (mode === 'project') {
        endpoint = '/api/ai-project-writer';
        const urlsArray = inputValue
          .split('\n')
          .map(u => u.trim())
          .filter(u => u.startsWith('http'));

        if (urlsArray.length === 0) {
          throw new Error('Vui lòng dán ít nhất 1 đường link URL bắt đầu bằng http:// hoặc https://');
        }

        payload = { urls: urlsArray };
      } else {
        payload = { type: mode, data: inputValue };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem', textAlign: 'center' }}>
          🤖 Công Cụ AI Viết Bài & Tạo Dự Án BĐS
        </h1>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-dark-light)', padding: '2rem', borderRadius: '12px', maxWidth: '400px', margin: '2rem auto' }}>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Vui lòng nhập mật khẩu để sử dụng công cụ nội bộ này.</p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Mật khẩu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..." 
                required
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
            {error && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
            <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              🔓 Mở Khóa
            </button>
          </form>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
              Công cụ tự động hóa nội dung BĐS bằng Gemini AI. Chọn loại công cụ bên dưới để bắt đầu.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { setMode('project'); setInputValue(''); setResult(null); setError(''); }}
                style={{ 
                  padding: '0.8rem 1.4rem', 
                  borderRadius: '30px', 
                  fontWeight: 600, 
                  border: mode === 'project' ? 'none' : '1px solid var(--border-color)', 
                  background: mode === 'project' ? 'var(--color-primary)' : 'transparent', 
                  color: mode === 'project' ? '#111' : 'var(--color-text)',
                  cursor: 'pointer'
                }}
              >
                🏢 Tạo Dự Án từ 1-5 Link Nguồn
              </button>
              <button 
                onClick={() => { setMode('url'); setInputValue(''); setResult(null); setError(''); }}
                style={{ 
                  padding: '0.8rem 1.4rem', 
                  borderRadius: '30px', 
                  fontWeight: 600, 
                  border: mode === 'url' ? 'none' : '1px solid var(--border-color)', 
                  background: mode === 'url' ? 'var(--color-primary)' : 'transparent', 
                  color: mode === 'url' ? '#111' : 'var(--color-text)',
                  cursor: 'pointer'
                }}
              >
                🔗 Viết Tin Tức từ 1 Link
              </button>
              <button 
                onClick={() => { setMode('topic'); setInputValue(''); setResult(null); setError(''); }}
                style={{ 
                  padding: '0.8rem 1.4rem', 
                  borderRadius: '30px', 
                  fontWeight: 600, 
                  border: mode === 'topic' ? 'none' : '1px solid var(--border-color)', 
                  background: mode === 'topic' ? 'var(--color-primary)' : 'transparent', 
                  color: mode === 'topic' ? '#111' : 'var(--color-text)',
                  cursor: 'pointer'
                }}
              >
                💡 Viết Tin Tức từ Chủ Đề
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-dark-light)', padding: '2rem', borderRadius: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {mode === 'project' && 'Dán các đường link nguồn về dự án (Mỗi link 1 dòng, tối đa 5 link):'}
                  {mode === 'url' && 'URL Bài viết nguồn (1 link):'}
                  {mode === 'topic' && 'Chủ đề / Yêu cầu viết bài:'}
                </label>
                
                {mode === 'project' ? (
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`https://batdongsan.com.vn/du-an-a\nhttps://cafef.vn/bai-viet-ve-du-an-a\nhttps://trangchu-duan-a.vn`}
                    required
                    rows={5}
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.95rem' }}
                  />
                ) : mode === 'url' ? (
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

                {mode === 'project' && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    💡 Mẹo: Dán từ 3-5 link từ nhiều nguồn báo khác nhau để AI tổng hợp đầy đủ nhất các mục (Vị trí, Tiện ích, Bảng giá, Pháp lý, Q&A).
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="btn" 
                disabled={loading}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading 
                  ? (mode === 'project' ? '⚡ AI đang cào dữ liệu & bóc tách dự án (Khoảng 25-45s)...' : '⚡ AI đang tổng hợp bài viết (Khoảng 15-30s)...') 
                  : (mode === 'project' ? '🚀 Bắt Đầu Tạo Dự Án BĐS' : '🚀 Chạy AI Viết Bài')}
              </button>
            </form>

            {error && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
                <strong>Lỗi:</strong> {error}
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Vui lòng kiểm tra lại cấu hình <strong>GEMINI_API_KEY</strong> và <strong>SANITY_API_TOKEN</strong> trong file .env.local.</p>
              </div>
            )}

            {result && (
              <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ color: '#22c55e', fontSize: '1.5rem', marginBottom: '0.8rem' }}>🎉 Hoàn Tất Xử Lý!</h3>
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text)', fontSize: '1.05rem' }}>
                  {mode === 'project' 
                    ? `Dự án "${result.title || 'Mới'}" đã được AI bóc tách từ ${result.sourcesCount || 'các'} link nguồn và lưu dạng Bản Nháp (Draft Project) trên Sanity.`
                    : 'Bài viết đã được AI viết lại thành công và lưu dưới dạng Bản Nháp (Draft).'
                  }
                </p>
                <a href={result.studioUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-block' }}>
                  📝 Mở bài viết trong Sanity Studio để xem & xuất bản
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
