import type { Metadata } from 'next';
import Link from 'next/link';
import { client } from '../../../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Khám phá các Chủ đầu tư Uy tín',
  description: 'Tìm hiểu về các nhà phát triển dự án hàng đầu, từ kinh nghiệm, quy mô cho đến những dự án tiêu biểu.',
  openGraph: {
    type: 'website',
    title: 'Khám phá các Chủ đầu tư Uy tín',
    description: 'Tìm hiểu về các nhà phát triển dự án hàng đầu, từ kinh nghiệm, quy mô cho đến những dự án tiêu biểu.',
  },
};

export const revalidate = 60;

export default async function DevelopersPage() {
  const developers = await client.fetch(`*[_type == "developer"] | order(isFeatured desc, order asc, _createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    "logoUrl": logo.asset->url,
    location,
    foundedYear,
    country,
    isFeatured,
    description,
    "projectCount": count(*[_type == "project" && (developer._ref == ^._id || ^._id in developers[]._ref)])
  }`);

  return (
    <div className={styles.container}>
      {/* HEADER HERO */}
      <section className={styles.heroSection}>
        <div className="container-wide">
          <h1 className={styles.heroTitle}>Khám phá các chủ đầu tư uy tín</h1>
          <p className={styles.heroSubtitle}>Tìm hiểu về các nhà phát triển dự án hàng đầu, từ kinh nghiệm, quy mô cho đến những dự án tiêu biểu</p>
          
          <div className={styles.searchContainer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Tìm chủ đầu tư..." 
              className={styles.searchInput}
            />
          </div>
        </div>
      </section>

      {/* DEVELOPERS LIST */}
      <section className={styles.listSection}>
        <div className="container-wide">
          <div className={styles.grid}>
            {developers.map((dev: any) => (
              <div key={dev._id} className={styles.card}>
                {/* LEO TRÁI: LOGO */}
                <div className={styles.logoWrapper}>
                  {dev.logoUrl ? (
                    <img src={dev.logoUrl} alt={dev.name} className={styles.logo} />
                  ) : (
                    <div className={styles.placeholderLogo}>{dev.name.charAt(0)}</div>
                  )}
                </div>

                {/* CONTENT PHẢI */}
                <div className={styles.contentWrapper}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2 className={styles.devName}>{dev.name}</h2>
                      <div className={styles.location}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {dev.location || 'Đang cập nhật'}
                      </div>
                    </div>
                    {dev.isFeatured && (
                      <span className={styles.badgeFeatured}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        Nổi bật
                      </span>
                    )}
                  </div>

                  <div className={styles.description}>
                    {dev.description && dev.description.length > 0 ? (
                      <div className={styles.truncateText}>
                        {dev.description[0].children?.map((child: any) => child.text).join('')}
                      </div>
                    ) : (
                      'Thông tin chi tiết đang được cập nhật...'
                    )}
                  </div>

                  <div className={styles.tagsContainer}>
                    {dev.foundedYear && <span className={styles.tag}>Thành lập: {dev.foundedYear}</span>}
                    {dev.country && <span className={styles.tag}>Quốc gia: {dev.country}</span>}
                    {dev.projectCount !== undefined && <span className={styles.tag}>{dev.projectCount} dự án</span>}
                  </div>

                  <div className={styles.actions}>
                    <Link href={`/chu-dau-tu/${dev.slug}`} className={styles.btnSecondary}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      Dự án
                    </Link>
                    <Link href={`/chu-dau-tu/${dev.slug}`} className={styles.btnPrimary}>
                      Xem chi tiết &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
