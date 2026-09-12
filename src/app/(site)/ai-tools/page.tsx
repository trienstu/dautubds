'use client';

import React, { useState, useEffect } from 'react';

interface ProjectOption {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  price?: string;
  status?: string;
}

export default function AiToolsPage() {
  const [mode, setMode] = useState<'url' | 'topic' | 'project' | 'update_project'>('project');
  const [inputValue, setInputValue] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [existingProjects, setExistingProjects] = useState<ProjectOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const fetchProjects = async () => {
    if (existingProjects.length > 0) return;
    setLoadingProjects(true);
    try {
      const res = await fetch('/api/projects/list');
      const data = await res.json();
      if (data.projects) {
        setExistingProjects(data.projects);
        if (data.projects.length > 0 && !projectSlug) {
          setProjectSlug(data.projects[0].slug);
        }
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách dự án:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

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

        payload = { action: 'create', urls: urlsArray };

      } else if (mode === 'update_project') {
        endpoint = '/api/ai-project-writer';
        if (!projectSlug.trim()) {
          throw new Error('Vui lòng chọn hoặc nhập slug dự án cần cập nhật');
        }
        const urlsArray = inputValue
          .split('\n')
          .map(u => u.trim())
          .filter(u => u.startsWith('http'));

        if (urlsArray.length === 0) {
          throw new Error('Vui lòng dán ít nhất 1 đường link bài viết mới về tiến độ/giá');
        }

        payload = { action: 'update', slug: projectSlug.trim(), urls: urlsArray };

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
          🤖 Công Cụ AI Viết Bài & Quản Lý Dự Án BĐS
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
              Hệ thống tự động hóa nội dung BĐS chuẩn Anti-Workflow & Gemini AI. Chọn công cụ bên dưới để bắt đầu:
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
                🏢 Tạo Dự Án Mới (1-5 Link)
              </button>
              <button 
                onClick={() => { 
                  setMode('update_project'); 
                  setInputValue(''); 
                  setResult(null); 
                  setError('');
                  fetchProjects();
                }}
                style={{ 
                  padding: '0.8rem 1.4rem', 
                  borderRadius: '30px', 
                  fontWeight: 600, 
                  border: mode === 'update_project' ? 'none' : '1px solid var(--border-color)', 
                  background: mode === 'update_project' ? 'var(--color-primary)' : 'transparent', 
                  color: mode === 'update_project' ? '#111' : 'var(--color-text)',
                  cursor: 'pointer'
                }}
              >
                🔄 Cập Nhật Dự Án Đã Có (Smart Merge)
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
              
              {mode === 'update_project' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Chọn Dự Án Cần Cập Nhật Trên Sanity:
                  </label>
                  {loadingProjects ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Đang tải danh sách dự án...</p>
                  ) : existingProjects.length > 0 ? (
                    <select
                      value={projectSlug}
                      onChange={(e) => setProjectSlug(e.target.value)}
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '1rem' }}
                    >
                      {existingProjects.map((p) => (
                        <option key={p._id} value={p.slug}>
                          {p.title} ({p.category || 'Dự án'} - {p.price || 'Chưa giá'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={projectSlug}
                      onChange={(e) => setProjectSlug(e.target.value)}
                      placeholder="Nhập slug hoặc ID của dự án..."
                      required
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)' }}
                    />
                  )}
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    🛡️ <strong>Bảo toàn SEO:</strong> Hệ thống sẽ giữ nguyên 100% ID và Slug (URL bài viết không đổi), chỉ cập nhật tiến độ, giá mới và ghép thêm ảnh công trường vào Gallery.
                  </p>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {mode === 'project' && 'Dán các đường link nguồn về dự án (Mỗi link 1 dòng, tối đa 5 link):'}
                  {mode === 'update_project' && 'Dán các đường link bài báo mới về TIẾN ĐỘ / BẢNG GIÁ / CHÍNH SÁCH MỚI (Mỗi link 1 dòng):'}
                  {mode === 'url' && 'URL Bài viết nguồn (1 link):'}
                  {mode === 'topic' && 'Chủ đề / Yêu cầu viết bài:'}
                </label>
                
                {mode === 'project' || mode === 'update_project' ? (
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      mode === 'update_project'
                        ? `https://cafef.vn/tien-do-thi-cong-thang-nay-tai-du-an\nhttps://vnexpress.net/bang-gia-dot-2-chinh-thuc`
                        : `https://batdongsan.com.vn/du-an-a\nhttps://cafef.vn/bai-viet-ve-du-an-a\nhttps://trangchu-duan-a.vn`
                    }
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
                    💡 Mẹo: Dán từ 2-5 link từ nhiều nguồn báo khác nhau để AI tổng hợp đầy đủ nhất các mục (Vị trí, Tiện ích, Bảng giá, Pháp lý, Q&A).
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
                  ? (mode === 'update_project' 
                      ? '⚡ AI đang tổng hợp & thực hiện Smart Merge (Khoảng 25-45s)...'
                      : mode === 'project' 
                        ? '⚡ AI đang cào dữ liệu & bóc tách dự án (Khoảng 25-45s)...' 
                        : '⚡ AI đang tổng hợp bài viết (Khoảng 15-30s)...') 
                  : (mode === 'update_project'
                      ? '🔄 Bắt Đầu Cập Nhật Hợp Nhất (Smart Merge)'
                      : mode === 'project' 
                        ? '🚀 Bắt Đầu Tạo Dự Án BĐS' 
                        : '🚀 Chạy AI Viết Bài')}
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
                <p style={{ marginBottom: '1rem', color: 'var(--color-text)', fontSize: '1.05rem' }}>
                  {result.isUpdate 
                    ? `Dự án "${result.title || ''}" đã được Smart Merge cập nhật thành công!`
                    : mode === 'project' 
                      ? `Dự án "${result.title || 'Mới'}" đã được AI bóc tách từ ${result.sourcesCount || 'các'} link nguồn và lưu thành công trên Sanity.`
                      : 'Bài viết đã được AI viết lại thành công.'
                  }
                </p>

                {result.updateNote && (
                  <p style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.95rem', color: 'var(--color-text-muted)', borderLeft: '4px solid #22c55e' }}>
                    <strong>📝 Nhật ký cập nhật:</strong> {result.updateNote}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {result.slug && (
                    <a href={`/du-an/${result.slug}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ display: 'inline-block' }}>
                      🌐 Xem Dự Án Trực Tiếp trên Web
                    </a>
                  )}
                  {result.studioUrl && (
                    <a href={result.studioUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-block' }}>
                      ⚙️ Quản trị trong Sanity Studio
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
