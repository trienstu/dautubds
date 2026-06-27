import Link from 'next/link';
import styles from './page.module.css';
import ProjectCard from '@/components/ProjectCard';
import NewsCard from '@/components/NewsCard';
import { client } from '../../../sanity/lib/client';

export const revalidate = 60;

export default async function Home() {
  const featuredProjects = await client.fetch(`*[_type == "project"] | order(_createdAt desc)[0...6] {
    "id": _id, title, "slug": slug.current, category, price, location, "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format", status
  }`);
  
  const latestNews = await client.fetch(`*[_type == "post" && isMarketAnalysis != true] | order(coalesce(date, _createdAt) desc)[0...3] {
    "id": _id, title, "slug": slug.current, excerpt, "date": coalesce(date, _createdAt), "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format"
  }`);

  const marketStats = await client.fetch(`*[_type == "post" && isMarketAnalysis == true] | order(coalesce(date, _createdAt) desc)[0...3] {
    "id": _id, title, excerpt, "date": coalesce(date, _createdAt)
  }`);

  const events = await client.fetch(`*[_type == "event"] | order(date asc)[0...3] {
    "id": _id, title, date, location, "imageUrl": image.asset->url + "?w=600&fit=max&auto=format"
  }`);

  const developers = await client.fetch(`*[_type == "developer"] | order(order asc) {
    "id": _id, name, "logoUrl": logo.asset->url + "?h=100&fit=max&auto=format"
  }`);

  return (
    <>
      {/* 1. HERO & SEARCH (Magazine Style) */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop" alt="Trien BDS Luxury Real Estate" />
        </div>
        <div className={styles.heroOverlay}></div>
        
        <div className={`container-wide ${styles.heroContent}`}>
          <div style={{ maxWidth: '800px' }}>
            <h1 className={styles.heroTitle}>Định Chuẩn <br/><span style={{ fontSize: '1.2em' }}>Sống Đẳng Cấp</span></h1>
            <p className={styles.heroSubtitle}>Khám phá bộ sưu tập bất động sản hạng sang bậc nhất dành riêng cho giới tinh hoa.</p>
            
            <form action="/du-an" method="GET" className={styles.searchBox}>
              <div className={styles.searchInputGroup}>
                <span className={styles.searchIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input aria-label="Tìm kiếm dự án" type="text" name="q" placeholder="Tên dự án, khu vực..." />
              </div>
              <select name="category" className={styles.searchSelect}>
                <option value="">Loại hình</option>
                <option value="Biệt thự">Biệt thự</option>
                <option value="Nhà phố">Nhà phố</option>
                <option value="Căn hộ">Căn hộ</option>
                <option value="Đất nền">Đất nền</option>
              </select>
              <select name="price" className={styles.searchSelect}>
                <option value="">Mức giá</option>
                <option value="Dưới 10 Tỷ">Dưới 10 Tỷ</option>
                <option value="10 - 50 Tỷ">10 - 50 Tỷ</option>
                <option value="Trên 50 Tỷ">Trên 50 Tỷ</option>
              </select>
              <button type="submit" className={styles.searchBtn}>TÌM KIẾM NGAY</button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. ABOUT TRIEN BDS (Overlapping Image) */}
      <section className="section container">
        <div className={styles.aboutWrapper}>
          <div className={styles.aboutContent}>
            <span className={styles.sectionLabel}>Về Chúng Tôi</span>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Dẫn Đầu Xu Hướng<br/><span>Bất Động Sản Hàng Hiệu</span></h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.9', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
              Với hơn một thập kỷ kinh nghiệm kiến tạo những biểu tượng sống đẳng cấp, Trien BDS tự hào là đơn vị tiên phong mang đến những kiệt tác kiến trúc và trải nghiệm sống hoàn mỹ. Chúng tôi không chỉ bán một tài sản, chúng tôi trao gửi một di sản.
            </p>
            <Link href="/ve-chung-toi" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              HÀNH TRÌNH CỦA CHÚNG TÔI <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>
          </div>
          <div className={styles.aboutImageContainer}>
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop" alt="Về Trien BDS" className={styles.aboutImgMain} />
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop" alt="Luxury Interior" className={styles.aboutImgSecondary} />
          </div>
        </div>
      </section>

      {/* 3. FEATURED EVENTS (Calendar List View) */}
      <section className={styles.eventsSection}>
        <div className="container-wide" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className={styles.sectionLabel}>Sự Kiện Sắp Tới</span>
            <h2 className="section-title" style={{ margin: 0 }}>Lịch Trình <span>Sự Kiện</span></h2>
          </div>
          
          {events.length > 0 ? (
            <div className={styles.eventsList}>
              {events.map((ev: any) => {
                const dateObj = ev.date ? new Date(ev.date) : new Date();
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString('vi-VN', { month: 'long' });
                return (
                  <div key={ev.id} className={styles.eventRow}>
                    <div className={styles.eventRowDate}>
                      <span className={styles.eventDay}>{day}</span>
                      <span className={styles.eventMonth}>{month}</span>
                    </div>
                    <div className={styles.eventRowContent}>
                      <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <span>Sự Kiện Đặc Biệt</span>
                      </div>
                      <h3 className={styles.eventRowTitle}>{ev.title}</h3>
                      <p className={styles.eventRowLocation}>📍 {ev.location || 'Địa điểm: Đang cập nhật'}</p>
                    </div>
                    <div className={styles.eventRowAction}>
                      <button className="btn btn-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>ĐĂNG KÝ NGAY</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>Đang cập nhật sự kiện mới...</p>
          )}
          
          <div className="text-center" style={{ marginTop: '3rem' }}>
             <Link href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none', borderBottom: '1px solid var(--color-primary)', paddingBottom: '0.2rem' }}>XEM TOÀN BỘ LỊCH TRÌNH</Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROJECTS (Asymmetric Grid) */}
      <section className="section container-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', padding: '0 1rem' }}>
          <div>
            <span className={styles.sectionLabel}>Bộ Sưu Tập</span>
            <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>Dự Án <span>Tuyệt Tác</span></h2>
          </div>
          <Link href="/du-an" className="btn btn-outline" style={{ display: 'none' /* Will show on mobile or rely on link below */ }}>XEM TOÀN BỘ</Link>
        </div>
        
        {featuredProjects.length > 0 ? (
          <div className={styles.asymmetricGrid}>
            {featuredProjects.map((project: any, index: number) => {
               // Make the 1st and 6th item large
               const isLarge = index === 0 || index === 5;
               return (
                 <div key={project.id} className={`${styles.asymCard} ${isLarge ? styles.asymCardLarge : styles.asymCardSmall}`}>
                   <Link href={`/du-an/${project.slug}`} style={{ display: 'block', height: '100%', position: 'relative' }}>
                     <div className={styles.asymImgWrapper}>
                        <img src={project.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} alt={project.title} />
                     </div>
                     <div className={styles.asymOverlay}>
                        <div style={{ background: 'var(--color-primary)', color: 'black', padding: '0.3rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: '4px', display: 'inline-block', marginBottom: '1rem' }}>{project.status || 'Đang mở bán'}</div>
                        <h3 className={styles.asymTitle} style={{ fontSize: isLarge ? '2.5rem' : '1.5rem' }}>{project.title}</h3>
                        <p className={styles.asymLocation}>📍 {project.location}</p>
                     </div>
                   </Link>
                 </div>
               );
            })}
          </div>
        ) : (
          <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>Đang cập nhật dự án mới...</p>
        )}
        
        <div className="text-center" style={{ marginTop: '4rem' }}>
          <Link href="/du-an" className="btn">KHÁM PHÁ TOÀN BỘ BỘ SƯU TẬP</Link>
        </div>
      </section>

      {/* 5. MARKET ANALYSIS (Stat Banner) */}
      <section className={styles.statBannerSection}>
        <div className="container-wide" style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.statBannerGrid}>
            <div className={styles.statBannerIntro}>
              <span className={styles.sectionLabel} style={{ color: 'white' }}>Góc Nhìn Chuyên Gia</span>
              <h2 style={{ fontSize: '2.5rem', color: 'white', margin: 0, lineHeight: 1.2 }}>Phân Tích<br/><span style={{ color: 'var(--color-primary)' }}>Thị Trường</span></h2>
            </div>
            {marketStats.length > 0 ? (
              marketStats.map((stat: any, i: number) => {
                const numbers = ['150+', '24%', '$2.5B'];
                return (
                  <div key={stat.id} className={styles.statBannerItem}>
                    <div className={styles.statBannerNum}>{numbers[i % 3]}</div>
                    <h3 className={styles.statBannerTitle}>{stat.title}</h3>
                    <p className={styles.statBannerDesc}>{stat.excerpt}</p>
                  </div>
                );
              })
            ) : null}
          </div>
        </div>
      </section>

      {/* 6. DEVELOPERS (Infinite Marquee) */}
      <section style={{ padding: '4rem 0', background: 'var(--color-dark)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className={styles.sectionLabel} style={{ fontSize: '0.75rem' }}>Đối Tác Chiến Lược</span>
        </div>
        
        {developers.length > 0 ? (
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeContent}>
              {[...developers, ...developers, ...developers].map((dev: any, i: number) => (
                <img key={`${dev.id}-${i}`} src={dev.logoUrl} alt={dev.name} className={styles.marqueeLogo} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>Đang cập nhật mạng lưới đối tác...</p>
        )}
      </section>

      {/* 7. NEWS (Magazine Style) */}
      <section className="section" style={{ backgroundColor: 'var(--background)' }}>
        <div className="container-wide">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem', padding: '0 1rem' }}>
            <div>
              <span className={styles.sectionLabel}>Tạp Chí Đầu Tư</span>
              <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>Tin Tức & <span>Kiến Thức</span></h2>
            </div>
            <Link href="/tin-tuc" className="btn btn-outline" style={{ display: 'none' }}>TẤT CẢ TIN TỨC</Link>
          </div>
          
          {latestNews.length > 0 ? (
            <div className={styles.magazineGrid}>
              {/* Bài báo chính (Left) */}
              <div className={styles.magMainArticle}>
                <NewsCard article={latestNews[0]} />
              </div>
              
              {/* Các bài phụ (Right Stack) */}
              <div className={styles.magSideArticles}>
                {latestNews.slice(1).map((article: any) => (
                  <div key={article.id} className={styles.magSideItem}>
                    <div style={{ width: '120px', height: '120px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                       <img src={article.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '1px' }}>
                         {article.date ? new Date(article.date).toLocaleDateString('vi-VN') : 'MỚI NHẤT'}
                      </div>
                      <Link href={`/tin-tuc/${article.slug}`}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: 1.4 }} className="hover:text-primary transition-colors">{article.title}</h3>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>Đang cập nhật tin tức...</p>
          )}
          <div className="text-center" style={{ marginTop: '3rem' }}>
             <Link href="/tin-tuc" className="btn btn-outline">Xem Tất Cả Tin Tức</Link>
          </div>
        </div>
      </section>
    </>
  );
}
