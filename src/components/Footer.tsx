import Link from 'next/link';
import { client } from '../../sanity/lib/client';

export default async function Footer({ config }: { config?: any }) {
  // Fetch pages for "Hỗ trợ" column
  const pages = await client.fetch(`*[_type == "page"] | order(_createdAt asc) { title, "slug": slug.current }`);
  
  // Fetch featured developers
  const developers = await client.fetch(`*[_type == "developer"] | order(_createdAt desc)[0...4] { name, "slug": slug.current }`);

  return (
    <footer style={{ backgroundColor: '#0f172a', paddingTop: '5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}>
      <style>{`
        .footer-link { color: #94a3b8; text-decoration: none; transition: color 0.3s; }
        .footer-link:hover { color: white; }
        .footer-dev-tag { background: #1e293b; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; color: #e2e8f0; text-decoration: none; transition: background 0.2s; }
        .footer-dev-tag:hover { background: #334155; }
      `}</style>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', marginBottom: '4rem' }}>
          
          {/* Cột 1: Thông tin thương hiệu */}
          <div style={{ flex: '1 1 280px', maxWidth: '350px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
              {config?.logoUrl ? (
                <div style={{ background: '#3b82f6', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px' }}>
                  <img src={config.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                </div>
              ) : (
                <div style={{ background: '#3b82f6', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  T
                </div>
              )}
              <div>
                <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>{config?.siteName || 'dautubds.io.vn'}</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Nền tảng BĐS #1</span>
              </div>
            </Link>
            <p style={{ lineHeight: '1.7', marginBottom: '2rem', fontSize: '0.95rem' }}>
              {config?.footerAbout || 'Nền tảng kết nối bất động sản hàng đầu Việt Nam, được tin tưởng bởi hàng nghìn khách hàng và chủ đầu tư uy tín.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#3b82f6', fontSize: '1.2rem', marginTop: '2px' }}>📞</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Hotline: {config?.phone || '0938717375'}</div>
                  <div style={{ fontSize: '0.85rem' }}>24/7 hỗ trợ khách hàng</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#3b82f6', fontSize: '1.2rem', marginTop: '2px' }}>✉️</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>{config?.email || 'support@duan.com.vn'}</div>
                  <div style={{ fontSize: '0.85rem' }}>Phản hồi trong 2 giờ</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#3b82f6', fontSize: '1.2rem', marginTop: '2px' }}>📍</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '1rem', lineHeight: '1.4' }}>{config?.address || 'Toà nhà Sabay Tower, số 11A Hồng Hà, Phường Tân Sơn Hòa, TP.HCM'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 2: Dự án */}
          <div style={{ flex: '1 1 120px' }}>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Dự án</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              {config?.footerProjects && config.footerProjects.length > 0 ? (
                config.footerProjects.map((link: any, idx: number) => (
                  <li key={idx}><Link href={link.url || '#'} className="footer-link">{link.title}</Link></li>
                ))
              ) : (
                <>
                  <li><Link href="/du-an" className="footer-link">Tất cả dự án</Link></li>
                  <li><Link href="/du-an?category=can-ho" className="footer-link">Căn hộ chung cư</Link></li>
                  <li><Link href="/du-an?category=nha-pho" className="footer-link">Nhà phố</Link></li>
                  <li><Link href="/du-an?category=biet-thu" className="footer-link">Biệt thự</Link></li>
                  <li><Link href="/du-an?category=dat-nen" className="footer-link">Đất nền</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Cột 3: Khu vực */}
          <div style={{ flex: '1 1 120px' }}>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Khu vực</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              {config?.footerRegions && config.footerRegions.length > 0 ? (
                config.footerRegions.map((link: any, idx: number) => (
                  <li key={idx}><Link href={link.url || '#'} className="footer-link">{link.title}</Link></li>
                ))
              ) : (
                <>
                  <li><Link href="#" className="footer-link">TP. Hồ Chí Minh</Link></li>
                  <li><Link href="#" className="footer-link">Hà Nội</Link></li>
                  <li><Link href="#" className="footer-link">Đà Nẵng</Link></li>
                  <li><Link href="#" className="footer-link">Nha Trang</Link></li>
                  <li><Link href="#" className="footer-link">Hải Phòng</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Cột 4: Tin tức */}
          <div style={{ flex: '1 1 120px' }}>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Tin tức</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              {config?.footerNews && config.footerNews.length > 0 ? (
                config.footerNews.map((link: any, idx: number) => (
                  <li key={idx}><Link href={link.url || '#'} className="footer-link">{link.title}</Link></li>
                ))
              ) : (
                <>
                  <li><Link href="/tin-tuc" className="footer-link">Phân tích thị trường</Link></li>
                  <li><Link href="/tin-tuc" className="footer-link">Quy hoạch</Link></li>
                  <li><Link href="/tin-tuc" className="footer-link">Kinh nghiệm đầu tư</Link></li>
                  <li><Link href="/tin-tuc" className="footer-link">Tư vấn pháp lý</Link></li>
                  <li><Link href="/tin-tuc" className="footer-link">Xu hướng BĐS</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Cột 5: Hỗ trợ */}
          <div style={{ flex: '1 1 120px' }}>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Hỗ trợ</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <li><Link href="/lien-he" className="footer-link">Liên hệ</Link></li>
              {pages && pages.map((page: any, idx: number) => (
                <li key={idx}><Link href={`/trang/${page.slug}`} className="footer-link">{page.title}</Link></li>
              ))}
              {!pages || pages.length === 0 ? (
                <>
                  <li><Link href="#" className="footer-link">Quy chế hoạt động</Link></li>
                  <li><Link href="#" className="footer-link">Điều khoản sử dụng</Link></li>
                  <li><Link href="#" className="footer-link">Chính sách bảo mật</Link></li>
                  <li><Link href="#" className="footer-link">Giải quyết khiếu nại</Link></li>
                </>
              ) : null}
            </ul>
          </div>

          {/* Cột 6: Đăng ký & CĐT */}
          <div style={{ flex: '1 1 280px', maxWidth: '350px' }}>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Nhận tin tức mới nhất</h4>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>Đăng ký để nhận thông tin về thị trường BĐS, dự án mới và ưu đãi độc quyền.</p>
            <form style={{ display: 'flex', marginBottom: '1rem', position: 'relative' }}>
              <input 
                type="email" 
                aria-label="Email của bạn"
                placeholder="Email của bạn" 
                style={{ width: '100%', padding: '0.8rem 1rem', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} 
              />
              <button aria-label="Gửi" type="button" style={{ position: 'absolute', right: '5px', top: '5px', bottom: '5px', background: 'transparent', border: 'none', color: 'white', padding: '0 0.8rem', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
            <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              Chúng tôi tôn trọng quyền riêng tư của bạn
            </div>

            <h4 style={{ color: 'white', marginBottom: '1.2rem', fontSize: '1.1rem', fontWeight: 600 }}>Chủ đầu tư nổi bật</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {developers && developers.length > 0 ? developers.map((dev: any, idx: number) => (
                <Link key={idx} href={`/chu-dau-tu/${dev.slug}`} className="footer-dev-tag">
                  {dev.name}
                </Link>
              )) : (
                <>
                  <Link href="#" className="footer-dev-tag">Vingroup</Link>
                  <Link href="#" className="footer-dev-tag">CapitaLand</Link>
                  <Link href="#" className="footer-dev-tag">Masterise Homes</Link>
                  <Link href="#" className="footer-dev-tag">Sunshine Group</Link>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 0', fontSize: '0.9rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>&copy; {new Date().getFullYear()} {config?.siteName || 'dautubds.io.vn'}. Tất cả quyền được bảo lưu.</div>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="#" className="footer-link">Chính sách bảo mật</Link>
            <Link href="#" className="footer-link">Điều khoản sử dụng</Link>
            <Link href="#" className="footer-link">Quy chế hoạt động</Link>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              SSL Secured
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              99.9% Uptime
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
