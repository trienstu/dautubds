'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass, CheckCircle2, AlertCircle } from 'lucide-react';
import { tinhPhongThuy, PhongThuyResult } from '@/utils/phongThuy';

export default function PhongThuyPage() {
  const [namSinh, setNamSinh] = useState<string>('');
  const [gioiTinh, setGioiTinh] = useState<'nam' | 'nu'>('nam');
  const [result, setResult] = useState<PhongThuyResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(namSinh);
    if (!isNaN(year) && year >= 1900 && year <= 2100) {
      const data = tinhPhongThuy(year, gioiTinh);
      setResult(data);
    }
  };

  return (
    <div className="container-wide" style={{ paddingTop: '2rem', paddingBottom: '5rem', minHeight: '80vh' }}>
      {/* Breadcrumb & Nút Back */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/cong-cu" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: 'var(--color-text-muted)',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'color 0.2s'
        }}>
          <ArrowLeft size={18} />
          Trở lại Hub Công Cụ
        </Link>
      </div>

      <div className="page-header-top">
        <div className="page-header-title-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '15px', borderRadius: '50%' }}>
              <Compass size={40} className="text-primary" />
            </div>
          </div>
          <h1 className="page-title-stylish">Tra Cứu Phong Thuỷ</h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Công cụ xem hướng nhà, màu sắc và ngũ hành bản mệnh hợp tuổi dựa trên Bát Trạch và Âm Dương Ngũ Hành.
          </p>
        </div>
      </div>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        backgroundColor: 'var(--color-secondary)',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: result ? '3rem' : '0' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Năm Sinh (Dương Lịch):</label>
              <input 
                type="number" 
                value={namSinh}
                onChange={(e) => setNamSinh(e.target.value)}
                placeholder="VD: 1990"
                min="1900"
                max="2100"
                required
                style={{
                  padding: '1rem 1.2rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Giới Tính:</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, padding: '0.9rem', border: `1px solid ${gioiTinh === 'nam' ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: '8px', backgroundColor: gioiTinh === 'nam' ? 'rgba(212, 175, 55, 0.05)' : 'var(--background)' }}>
                  <input type="radio" name="gender" value="nam" checked={gioiTinh === 'nam'} onChange={() => setGioiTinh('nam')} style={{ cursor: 'pointer' }} />
                  <span style={{ fontWeight: gioiTinh === 'nam' ? 600 : 400, color: gioiTinh === 'nam' ? 'var(--color-primary)' : 'inherit' }}>Nam Mạng</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, padding: '0.9rem', border: `1px solid ${gioiTinh === 'nu' ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: '8px', backgroundColor: gioiTinh === 'nu' ? 'rgba(212, 175, 55, 0.05)' : 'var(--background)' }}>
                  <input type="radio" name="gender" value="nu" checked={gioiTinh === 'nu'} onChange={() => setGioiTinh('nu')} style={{ cursor: 'pointer' }} />
                  <span style={{ fontWeight: gioiTinh === 'nu' ? 600 : 400, color: gioiTinh === 'nu' ? 'var(--color-primary)' : 'inherit' }}>Nữ Mạng</span>
                </label>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              marginTop: '0.5rem'
            }}
          >
            TRA CỨU NGAY
          </button>
        </form>

        {result && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-primary)' }}>
              Kết Quả Tra Cứu Phong Thuỷ
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: '1 1 calc(50% - 0.5rem)', backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Năm Sinh (Âm Lịch)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{result.namSinh} - {result.canChi}</div>
              </div>
              <div style={{ flex: '1 1 calc(50% - 0.5rem)', backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ngũ Hành Bản Mệnh</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{result.nguHanh}</div>
              </div>
              <div style={{ flex: '1 1 100%', backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Cung Phi Bát Trạch</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cung {result.cungPhi} - {result.menhQuai}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              {/* Hướng tốt */}
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
                  <CheckCircle2 size={24} />
                  4 Hướng Tốt (Nên Chọn)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.huongTot.map((h, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(22, 163, 74, 0.05)', borderLeft: '4px solid #16a34a', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#16a34a' }}>{h.ten}</strong>
                        <span style={{ fontWeight: 700 }}>Hướng {h.huong}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{h.yNghia}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hướng xấu */}
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
                  <AlertCircle size={24} />
                  4 Hướng Xấu (Cần Tránh)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.huongXau.map((h, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', borderLeft: '4px solid #dc2626', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#dc2626' }}>{h.ten}</strong>
                        <span style={{ fontWeight: 700 }}>Hướng {h.huong}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{h.yNghia}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Màu sắc */}
            <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Màu Sắc Hợp Mệnh</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ minWidth: '120px', color: 'var(--color-text-muted)' }}>Màu Tương Sinh:</span>
                  <strong style={{ color: '#16a34a' }}>{result.mauSac.tuongSinh}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ minWidth: '120px', color: 'var(--color-text-muted)' }}>Màu Tương Hợp:</span>
                  <strong style={{ color: '#2563eb' }}>{result.mauSac.tuongHop}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ minWidth: '120px', color: 'var(--color-text-muted)' }}>Màu Kiêng Kỵ:</span>
                  <strong style={{ color: '#dc2626' }}>{result.mauSac.kiengKy}</strong>
                </div>
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
