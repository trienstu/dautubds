'use client';

import { useState } from 'react';
import { Search, Copy, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const FacebookIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default function FindFbUidPage() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id?: string; message?: string; success?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) return;

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch('/api/tools/find-uid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.id) {
      navigator.clipboard.writeText(result.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container section page-header-container" style={{ minHeight: '80vh' }}>
      <div className="page-header-top">
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/cong-cu" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '5px', 
            color: 'var(--color-text-muted)', textDecoration: 'none',
            fontSize: '0.9rem', fontWeight: 500
          }}>
            <ArrowLeft size={16} /> Quay lại Công Cụ
          </Link>
        </div>

        <div className="page-header-title-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '15px', borderRadius: '50%' }}>
              <FacebookIcon size={40} className="text-primary" />
            </div>
          </div>
          <h1 className="page-title-stylish">Tìm UID Facebook</h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Công cụ chuyển đổi đường dẫn Facebook (Profile hoặc Fanpage) thành User ID (UID) hoàn toàn miễn phí, hỗ trợ chạy quảng cáo và marketing hiệu quả.
          </p>
        </div>
      </div>

      <div style={{ 
        maxWidth: '700px', 
        margin: '0 auto', 
        backgroundColor: 'var(--color-secondary)',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label htmlFor="fb-link" style={{ fontWeight: 600, color: 'var(--color-text)' }}>Nhập đường dẫn Facebook:</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                id="fb-link"
                type="text" 
                placeholder="Ví dụ: https://www.facebook.com/zuck"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--color-text)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !link.trim()}
              className="btn btn-primary"
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: (loading || !link.trim()) ? 'not-allowed' : 'pointer',
                opacity: (loading || !link.trim()) ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Đang quét...' : 'Lấy UID ngay'}
            </button>
          </div>
        </form>

        {result && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            borderRadius: '8px',
            backgroundColor: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {result.success ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle2 size={40} style={{ color: '#10b981' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Đã tìm thấy UID thành công:</p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    backgroundColor: 'var(--background)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '1px' }}>
                      {result.id}
                    </span>
                    <button 
                      onClick={handleCopy}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copied ? '#10b981' : 'var(--color-primary)',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      title="Copy UID"
                    >
                      {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                  {copied && <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.5rem' }}>Đã sao chép vào khay nhớ tạm!</p>}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <AlertCircle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#ef4444', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Lỗi trích xuất</h4>
                  <p style={{ color: 'var(--color-text)', lineHeight: '1.5' }}>{result.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Hướng dẫn sử dụng:</h4>
          <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.7', paddingLeft: '20px' }}>
            <li>Copy đường dẫn trang cá nhân (Profile) hoặc Fanpage Facebook cần lấy ID.</li>
            <li>Dán vào ô nhập liệu bên trên và bấm nút "Lấy UID".</li>
            <li>Hỗ trợ mọi định dạng link như: <code>facebook.com/username</code>, <code>fb.com/username</code>...</li>
            <li>UID (User ID) thường được sử dụng để quét tệp khách hàng, chạy quảng cáo Target đối tượng hoặc phân tích dữ liệu trên Facebook.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
