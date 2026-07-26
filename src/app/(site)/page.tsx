import Link from 'next/link';
import styles from './page.module.css';
import { client } from '../../../sanity/lib/client';
import type { Metadata } from 'next';
import { replaceDateShortcodes } from '@/utils/dateReplace';
import { Compass, Search, Calculator } from 'lucide-react';
import ProjectCarousel from '@/components/ProjectCarousel';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await client.fetch(`*[_type == "siteConfig"][0]{
    homeSeo {
      seoTitle,
      seoDescription,
      seoKeywords,
      "seoImageUrl": seoImage.asset->url
    }
  }`);
  
  const seo = config?.homeSeo || {};
  return {
    title: seo.seoTitle || 'Trang Chủ | Trien BDS - Định chuẩn BĐS Hạng Sang',
    description: seo.seoDescription || 'Khám phá bộ sưu tập bất động sản hạng sang bậc nhất dành riêng cho giới tinh hoa.',
    keywords: seo.seoKeywords || '',
    alternates: { canonical: 'https://www.dautubds.io.vn/' },
    openGraph: {
      title: seo.seoTitle || 'Trang Chủ | Trien BDS',
      description: seo.seoDescription || 'Khám phá bộ sưu tập bất động sản hạng sang bậc nhất.',
      url: 'https://www.dautubds.io.vn/',
      type: 'website',
      images: seo.seoImageUrl ? [{ url: seo.seoImageUrl }] : [],
    },
  };
}

export default async function Home() {
  const featuredProjects = await client.fetch(`*[_type == "project"] | order(_createdAt desc)[0...8] {
    "id": _id, title, "slug": slug.current, category, price, location, "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format", status, "developer": developers[0]->name
  }`);
  
  const latestNews = await client.fetch(`*[_type == "post"] | order(coalesce(date, _createdAt) desc)[0...5] {
    "id": _id, title, "slug": slug.current, excerpt, "date": coalesce(date, _createdAt), "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format"
  }`);

  const developers = await client.fetch(`*[_type == "developer"] | order(order asc) {
    "id": _id, name, "logoUrl": logo.asset->url + "?h=100&fit=max&auto=format"
  }`);

  const mainNews = latestNews[0];
  const sideNews = latestNews.slice(1);

  return (
    <>
      {/* 1. HERO & FLOATING SEARCH */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop" alt="Trien BDS Luxury Real Estate" />
        </div>
        <div className={styles.heroOverlay}></div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Định Chuẩn <span>Đẳng Cấp</span></h1>
          <p className={styles.heroSubtitle}>Khám phá bộ sưu tập bất động sản hạng sang bậc nhất, kiến tạo di sản trường tồn dành riêng cho giới tinh hoa.</p>
          
          <form action="/du-an" method="GET" className={styles.searchBox}>
            <div className={styles.searchInputGroup}>
              <span className={styles.searchIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input aria-label="Tìm kiếm dự án" type="text" name="q" placeholder="Tên dự án, khu vực bạn muốn tìm..." />
            </div>
            <select name="category" className={styles.searchSelect}>
              <option value="">Tất cả loại hình</option>
              <option value="biet-thu">Biệt thự</option>
              <option value="nha-pho">Nhà phố</option>
              <option value="can-ho">Căn hộ</option>
            </select>
            <button type="submit" className={styles.searchBtn}>TÌM KIẾM</button>
          </form>
        </div>
      </section>

      {/* 2. DỰ ÁN HOT (SHOWCASE CAROUSEL) */}
      <section className="section container-wide" style={{ paddingBottom: 0 }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <span className={styles.sectionLabel}>Dự Án Nổi Bật</span>
          <h2 className="section-title" style={{ margin: 0 }}>Tâm Điểm <span>Đầu Tư</span></h2>
        </div>
        
        <ProjectCarousel projects={featuredProjects} />
      </section>

      {/* 4. TIỆN ÍCH DÀNH CHO NGƯỜI MUA */}
      <section className="section container-wide" style={{ background: 'var(--background)' }}>
        <div className="container">
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <span className={styles.sectionLabel}>Công Cụ Trợ Giúp</span>
            <h2 className="section-title" style={{ margin: 0 }}>Tiện Ích <span>Thông Minh</span></h2>
          </div>
          
          <div className={styles.toolsGrid}>
            <Link href="/cong-cu/phong-thuy" className={styles.toolCard}>
              <div className={styles.toolIcon}>
                <Compass size={40} />
              </div>
              <h3 className={styles.toolTitle}>La Bàn Phong Thuỷ</h3>
              <p className={styles.toolDesc}>Tra cứu hướng nhà hợp tuổi, tính toán Cung Phi Bát Trạch chính xác.</p>
            </Link>
            
            <Link href="/cong-cu/find-facebook-uid" className={styles.toolCard}>
              <div className={styles.toolIcon}>
                <Search size={40} />
              </div>
              <h3 className={styles.toolTitle}>Tìm Facebook UID</h3>
              <p className={styles.toolDesc}>Lấy mã ID chuẩn từ đường link Facebook bất kỳ nhanh chóng.</p>
            </Link>

            <Link href="#" className={styles.toolCard}>
              <div className={styles.toolIcon}>
                <Calculator size={40} />
              </div>
              <h3 className={styles.toolTitle}>Tính Vay Ngân Hàng</h3>
              <p className={styles.toolDesc}>Ước tính số tiền trả góp hàng tháng dựa trên lãi suất và thời hạn.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CHỦ ĐẦU TƯ UY TÍN (MARQUEE) */}
      <section className="section container" style={{ paddingBottom: 0 }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 className="section-title" style={{ margin: 0, color: 'var(--foreground)' }}>Đối tác chiến lược</h2>
        </div>
      </section>
      <section className={styles.marqueeContainer} style={{ paddingTop: '1rem' }}>
        <div className={styles.marqueeContent}>
          {developers.map((dev: any) => (
            <img key={dev.id} src={dev.logoUrl} alt={dev.name} className={styles.marqueeLogo} loading="lazy" />
          ))}
          {/* Duplicate for infinite effect */}
          {developers.map((dev: any) => (
            <img key={`dup-${dev.id}`} src={dev.logoUrl} alt={dev.name} className={styles.marqueeLogo} loading="lazy" />
          ))}
          {developers.map((dev: any) => (
            <img key={`dup2-${dev.id}`} src={dev.logoUrl} alt={dev.name} className={styles.marqueeLogo} loading="lazy" />
          ))}
        </div>
      </section>

      {/* 6. ĐIỂM TIN & PHÂN TÍCH (MAGAZINE) */}
      <section className="section container">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 className="section-title" style={{ margin: 0, color: 'var(--foreground)' }}>Tin tức bất động sản</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto 0' }}>
            Tin tức mới nhất, phân tích xu hướng thị trường, cập nhật nhanh chóng và chính xác hàng ngày
          </p>
        </div>

        {mainNews ? (
          <div className={styles.magazineGrid}>
            <Link href={`/tin-tuc/${mainNews.slug}`} className={styles.magMainArticle}>
              <img src={mainNews.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} alt={mainNews.title} loading="lazy" />
              <div className={styles.magMainOverlay}>
                <h3 className={styles.magMainTitle}>{replaceDateShortcodes(mainNews.title)}</h3>
                <p className={styles.magMainDate}>
                  {new Date(mainNews.date).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </Link>

            <div className={styles.magSideArticles}>
              {sideNews.map((news: any) => (
                <Link key={news.id} href={`/tin-tuc/${news.slug}`} className={styles.magSideItem}>
                  <img src={news.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} alt={news.title} className={styles.magSideImg} loading="lazy" />
                  <div className={styles.magSideContent}>
                    <h3 className={styles.magSideTitle}>{replaceDateShortcodes(news.title)}</h3>
                    <div className={styles.magSideDate}>{new Date(news.date).toLocaleDateString('vi-VN')}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>Đang cập nhật tin tức mới...</p>
        )}
        
        <div className="text-center" style={{ marginTop: '2rem' }}>
           <Link href="/tin-tuc" className={styles.btnViewMore}>Xem thêm bài viết →</Link>
        </div>
      </section>

      {/* 7. LEAD MAGNET (NEWSLETTER) */}
      <section className="section container" style={{ paddingTop: '2rem' }}>
        <div className={styles.leadMagnet}>
          <div className={styles.leadContent}>
            <h2 className={styles.leadTitle}>Nắm Bắt Cơ Hội Đầu Tư</h2>
            <p className={styles.leadDesc}>Đăng ký ngay để nhận báo cáo phân tích thị trường Bất Động Sản hàng tuần cùng các ưu đãi độc quyền nội bộ từ Trien BDS.</p>
            <form className={styles.leadForm} action="#">
              <input type="email" placeholder="Nhập địa chỉ Email của bạn..." required />
              <button type="submit">NHẬN BÁO CÁO NGAY</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
