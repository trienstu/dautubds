import Link from 'next/link';
import type { Metadata } from 'next';
import { Search, Compass } from 'lucide-react';

const FacebookIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export const metadata: Metadata = {
  title: 'Công Cụ Hỗ Trợ',
  description: 'Tổng hợp các công cụ tiện ích hỗ trợ đầu tư và marketing bất động sản.',
  alternates: {
    canonical: 'https://www.dautubds.io.vn/cong-cu',
  },
};

const tools = [
  {
    title: 'Tra Cứu Phong Thuỷ',
    description: 'Xem hướng nhà, màu sắc, và ngũ hành bản mệnh hợp tuổi để chọn mua bất động sản đón tài lộc.',
    icon: <Compass className="w-8 h-8 text-primary" />,
    href: '/cong-cu/phong-thuy',
    badge: 'Hot',
  },
  {
    title: 'Tìm UID Facebook',
    description: 'Chuyển đổi đường dẫn Facebook (cá nhân hoặc fanpage) thành User ID (UID) phục vụ cho các chiến dịch marketing.',
    icon: <FacebookIcon className="w-8 h-8 text-primary" size={32} />,
    href: '/cong-cu/find-facebook-uid',
    badge: 'Mới',
  },
  // Có thể dễ dàng thêm các tool mới vào mảng này trong tương lai
];

export default function ToolsHubPage() {
  return (
    <div className="container page-header-container">
      <div className="page-header-top">
        <div className="page-header-title-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="page-title-stylish">Công Cụ Tiện Ích</h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Tổng hợp các phần mềm và công cụ trực tuyến miễn phí hỗ trợ công việc marketing và kinh doanh bất động sản.
          </p>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '2rem' }}>
        {tools.map((tool, index) => (
          <Link href={tool.href} key={index} style={{ textDecoration: 'none' }}>
            <div className="tool-card" style={{
              backgroundColor: 'var(--color-secondary)',
              borderRadius: '12px',
              padding: '2rem',
              height: '100%',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              cursor: 'pointer',
            }}>
              {tool.badge && (
                <span style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-dark)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  borderRadius: '20px',
                }}>
                  {tool.badge}
                </span>
              )}
              <div style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}>
                {tool.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
                {tool.title}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6', flex: 1 }}>
                {tool.description}
              </p>
              <div style={{ 
                marginTop: '1.5rem', 
                color: 'var(--color-primary)', 
                fontWeight: 600, 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                Sử dụng ngay 
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
