import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { client } from '../../../../../sanity/lib/client';
import HtmlRenderer from '@/components/HtmlRenderer';
import ProjectGallery from '@/components/ProjectGallery';
import ProjectTabs from '@/components/ProjectTabs';
import Tour360Facade from '@/components/Tour360Facade';
import ConsultantSidebar from '@/components/ConsultantSidebar';
import ConsultantCardMobile from '@/components/ConsultantCardMobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import MortgageCalculator from '@/components/MortgageCalculator';
import ProjectActionButtons from '@/components/ProjectActionButtons';
import ProjectFAQ from '@/components/ProjectFAQ';
import { PortableText } from '@portabletext/react';
import urlBuilder from '@sanity/image-url';
import { replaceDateShortcodes, replaceDeepShortcodes } from '@/utils/dateReplace';

const builder = urlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <img
          className="pt-image"
          alt={value.alt || 'Hình ảnh dự án'}
          loading="lazy"
          src={urlFor(value).width(1200).fit('max').auto('format').url()}
          style={{ width: '100%', borderRadius: '8px', margin: '1rem 0' }}
        />
      );
    },
    imageSlider: ({ value }: any) => {
      if (!value?.images || value.images.length === 0) return null;
      const imageUrls = value.images.map((img: any) => urlFor(img).width(1200).fit('max').auto('format').url());
      return (
        <div style={{ margin: '2rem 0' }}>
          <ProjectGallery images={imageUrls} />
        </div>
      );
    },
    youtube: ({ value }: any) => {
      const { url } = value;
      const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      if (!id) return null;
      return (
        <div className="pt-image" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', margin: '1rem 0', borderRadius: '8px' }}>
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src={`https://www.youtube.com/embed/${id}`} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      );
    },
    table: ({ value }: any) => {
      if (!value || !value.rows || value.rows.length === 0) return null;
      const [head, ...rows] = value.rows;
      return (
        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', margin: '1rem 0', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'auto', wordBreak: 'break-word' }}>
            {head && head.cells && (
              <thead style={{ background: 'var(--color-dark-light)' }}>
                <tr>
                  {head.cells.map((cell: string, i: number) => (
                    <th key={i} style={{ borderBottom: '2px solid var(--border-color)', padding: '12px 16px', fontWeight: 600, color: 'var(--foreground)' }}>{cell}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--color-secondary)' }}>
                  {row.cells.map((cell: string, j: number) => (
                    <td key={j} style={{ padding: '12px 16px', color: 'var(--color-text)', wordBreak: 'break-word', whiteSpace: 'normal' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  },
  list: {
    bullet: ({ children }: any) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', marginBottom: '0.8rem', color: 'var(--color-text)', fontSize: '1.05rem' }}>{children}</ul>,
    number: ({ children }: any) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', marginBottom: '0.8rem', color: 'var(--color-text)', fontSize: '1.05rem' }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>{children}</li>,
    number: ({ children }: any) => <li style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>{children}</li>,
  },
  block: {
    normal: ({ children }: any) => <p style={{ textAlign: 'justify', marginBottom: '0.8rem' }}>{children}</p>,
    h2: ({ children }: any) => <h2 style={{ marginTop: '1rem', marginBottom: '0.8rem' }}>{children}</h2>,
    h3: ({ children }: any) => <h3 style={{ marginTop: '1rem', marginBottom: '0.8rem' }}>{children}</h3>,
    h4: ({ children }: any) => <h4 style={{ marginTop: '1rem', marginBottom: '0.8rem' }}>{children}</h4>,
  },
  marks: {
    textAlign: ({ children, value }: any) => (
      <span style={{ display: 'block', textAlign: value?.align || 'left', width: '100%' }}>
        {children}
      </span>
    ),
  },
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const project = await client.fetch(`*[_type == "project" && slug.current == $slug][0]{
    ...,
    "imageUrl": imageUrl.asset->url,
    "floorPlans": floorPlans[].asset->url,
    "legalDocuments": legalDocuments[]{ title, "fileUrl": asset->url },
    "developer": developer->{
      name, seoDescription, seoKeywords, "seoImageUrl": seoImage.asset->url }
  }`, { slug });

  if (!project) return {};

  const title = project.seo?.seoTitle || project.title || 'Dự Án';
  const description = project.seo?.seoDescription || `Khám phá thông tin chi tiết về dự án ${project.title}.`;
  const image = project.seo?.seoImageUrl || project.imageUrl;

  return {
    title: replaceDateShortcodes(title),
    description: replaceDateShortcodes(description),
    keywords: project.seo?.seoKeywords,
    openGraph: {
      type: 'website',
      title: replaceDateShortcodes(title),
      description: replaceDateShortcodes(description),
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `https://www.dautubds.io.vn/du-an/${slug}`,
    },
  };
}

export const revalidate = 60;

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const query = `*[_type == "project" && slug.current == $slug][0] {
    ...,
    "imageUrl": imageUrl.asset->url + "?w=1920&fit=max&auto=format",
    "projectLogoUrl": projectLogo.asset->url + "?w=400&fit=max&auto=format",
    "galleryUrls": gallery[].asset->url,
    "floorPlans": floorPlans[].asset->url,
    "legalDocuments": legalDocuments[]{ title, "fileUrl": asset->url },
    locationContent,
    featuresContent,
    investmentReasons,
    "developer": developer->{name, "slug": slug.current, "logoUrl": logo.asset->url + "?w=400&fit=max&auto=format"},
    "developers": developers[]->{name, "slug": slug.current, "logoUrl": logo.asset->url + "?w=400&fit=max&auto=format"},
    consultant->{name, "avatarUrl": image.asset->url + "?w=400&fit=max&auto=format", bio, isVerified, phone, email, zaloUrl, facebookUrl}
  }`;
  
  const rawProject = await client.fetch(query, { slug });

  if (!rawProject) {
    notFound();
  }
  
  // Replace shortcodes for dynamic dates deeply in the entire project object
  const project = replaceDeepShortcodes(rawProject);

  // Optimize image arrays
  const optimizedGallery = project.galleryUrls?.map((url: string) => url + "?w=1200&fit=max&auto=format") || [];
  const optimizedFloorPlans = project.floorPlans?.map((url: string) => url + "?w=1200&fit=max&auto=format") || [];

  if (project.customLandingPage) {
    return (
      <>
        {project.hideLayoutComponents && (
          <style>{`header, nav, footer, [class*="floatingContainer"] { display: none !important; } main { padding-top: 0 !important; }`}</style>
        )}
        <HtmlRenderer html={project.customLandingPage} />
      </>
    );
  }

  // Khai báo Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://www.dautubds.io.vn' },
      { '@type': 'ListItem', position: 2, name: 'Dự án', item: 'https://www.dautubds.io.vn/du-an' },
      { '@type': 'ListItem', position: 3, name: project.title, item: `https://www.dautubds.io.vn/du-an/${slug}` },
    ],
  };

  const realEstateSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.title,
    description: project.description ? project.description.map((block: any) => block.children?.map((child: any) => child.text).join('')).join(' ') : '',
    image: project.imageUrl,
    url: `https://www.dautubds.io.vn/du-an/${slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: project.price ? project.price.replace(/[^0-9]/g, '') : '0', // Chỉ lấy số nếu có
      availability: 'https://schema.org/InStock'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: project.location || 'Đang cập nhật'
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateSchema) }} />
      <style>{`
        .project-grid { display: grid; grid-template-columns: 9fr 3fr; gap: 2.5rem; align-items: start; }
        .desktop-only { display: block; }
        .mobile-only { display: none !important; }
        .mobile-flex { display: none !important; }
        
        .responsive-map-iframe iframe { width: 100% !important; aspect-ratio: 16 / 9; height: auto !important; }
        .responsive-tour-iframe { width: 100% !important; aspect-ratio: 16 / 9; border-radius: 8px; border: none; }
        
        @media (max-width: 900px) {
          .project-grid, .project-grid-top { grid-template-columns: 1fr !important; }
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
          .mobile-flex { display: flex !important; }
          .responsive-map-iframe iframe { aspect-ratio: 4 / 3; }
          .responsive-tour-iframe { aspect-ratio: 1 / 1; }
        }
      `}</style>
      <article style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        <div className="container-wide" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', transition: 'color 0.2s' }}>Trang chủ</Link>
            <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>/</span>
            <Link href="/du-an" style={{ color: 'var(--color-primary)', textDecoration: 'none', transition: 'color 0.2s' }}>Dự án</Link>
            <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>/</span>
            <span style={{ color: 'var(--foreground)' }}>{project.title}</span>
          </div>
        </div>

        {/* KHU VỰC TOP: Slider + Summary Card */}
        <div className="container-wide" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '9fr 3fr', gap: '2.5rem', alignItems: 'start' }} className="project-grid-top">
            
            {/* CỘT TRÁI (Top): Slider Hình Ảnh */}
            <div style={{ width: '100%', overflow: 'hidden' }}>
              {project.galleryUrls && project.galleryUrls.length > 0 ? (
                <ProjectGallery images={project.imageUrl ? [project.imageUrl, ...project.galleryUrls] : project.galleryUrls} />
              ) : (
              <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '700px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img 
                    src={project.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                    alt={project.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              )}
            </div>

            {/* CỘT PHẢI (Top): Summary Card */}
            <div style={{ background: 'var(--color-secondary)', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              
              {/* Logo & Tên dự án */}
              <div style={{ textAlign: 'center' }}>
                {project.projectLogoUrl ? (
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', background: 'var(--color-dark)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={project.projectLogoUrl} alt={project.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (project.developers && project.developers.length > 0) || (project.developer && project.developer.logoUrl) ? (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto 1rem',
                    background: 'white',
                    borderRadius: '50%',
                    padding: '5px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img 
                      src={project.developers?.length > 0 ? project.developers[0].logoUrl : project.developer?.logoUrl} 
                      alt="Logo CĐT" 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                ) : null}
                <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>{project.title}</h1>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span>📍</span> {project.location || 'Đang cập nhật'}
                </div>
              </div>
              
              {/* Giá */}
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.2rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <div style={{ color: '#60a5fa', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Mức giá chính thức</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa' }}>{project.price || 'Đang cập nhật'}</div>
              </div>

              {/* Nút Liên hệ */}
              <ProjectActionButtons projectTitle={project.title} />

              {/* Thống kê Mini */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.2rem' }}>{project.productCount || '--'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Tổng số sản phẩm</div>
                </div>
                <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.2rem' }}>{project.viewCount || '367'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Lượt xem</div>
                </div>
              </div>

              {/* Khởi công & Tiến độ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Ngày khởi công
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem' }}>{project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                      Tiến độ xây dựng
                    </div>
                    <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.9rem' }}>{project.progressPercentage || 0}%</div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${project.progressPercentage || 0}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Nhãn CĐT */}
              {(project.developers?.length > 0) ? (
                <div style={{ display: 'flex', gap: '15px' }}>
                  {project.developers.map((dev: any, idx: number) => (
                    <Link key={idx} href={`/chu-dau-tu/${dev.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                      <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <img src={dev.logoUrl} alt="Logo CĐT" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#60a5fa' }}>{dev.name}</div>
                    </Link>
                  ))}
                </div>
              ) : project.developer && (
                <Link href={`/chu-dau-tu/${project.developer.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                     <img src={project.developer.logoUrl} alt="Logo CĐT" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#60a5fa' }}>{project.developer.name}</div>
                </Link>
              )}

            </div>
          </div>
        </div>

        <ProjectTabs project={project} />

        <div className="container-wide project-grid" style={{ paddingTop: '2rem' }}>
        {/* CỘT TRÁI: Nội dung chính */}
        <div style={{ position: 'relative', minWidth: 0 }}>
          
          {/* Tiêu đề & Tổng quan */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
              {project.category} • {project.status || 'Đang mở bán'}
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '1rem', lineHeight: 1.2, fontWeight: 700 }}>{project.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              <span>📍 {project.location || 'Đang cập nhật vị trí'}</span>
            </div>

            <div id="tong-quan" className="project-content-section" style={{ marginTop: 0 }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Tổng quan dự án {project.title}</h2>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
                {project.description ? (
                   <PortableText value={project.description} components={portableTextComponents} />
                ) : (
                   <p>Thông tin chi tiết đang được cập nhật...</p>
                )}
              </div>
            </div>
            
            {/* Vị trí */}
            {(project.mapHtml || project.locationContent) && (
              <div id="vi-tri" className="project-content-section">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Vị trí dự án {project.title}</h2>
                {project.mapHtml && (
                  <div className="responsive-map-iframe" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }} dangerouslySetInnerHTML={{ __html: project.mapHtml }} />
                )}
                {project.locationContent && (
                  <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
                    <PortableText value={project.locationContent} components={portableTextComponents} />
                  </div>
                )}
              </div>
            )}

            {/* Bảng giá */}
            {project.pricingContent && (
              <div id="bang-gia" className="project-content-section">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Bảng giá & Thanh toán dự án {project.title}</h2>
                <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
                  <PortableText value={project.pricingContent} components={portableTextComponents} />
                </div>
              </div>
            )}

            {/* Pháp lý */}
            {((project.legalDocuments && project.legalDocuments.length > 0) || project.legalContent) && (
              <div id="phap-ly" className="project-content-section">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Tài liệu pháp lý dự án {project.title}</h2>
                
                {project.legalContent && (
                  <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)', marginBottom: (project.legalDocuments && project.legalDocuments.length > 0) ? '2rem' : '0' }}>
                    <PortableText value={project.legalContent} components={portableTextComponents} />
                  </div>
                )}

                {project.legalDocuments && project.legalDocuments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {project.legalDocuments.map((doc: any, index: number) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-dark-light)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          <span style={{ fontWeight: 600 }}>{doc.title || `Tài liệu ${index + 1}`}</span>
                        </div>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ background: '#1877F2', color: 'white', padding: '0.4rem 1rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Xem PDF</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Consultant Card */}
            <div style={{ marginTop: '2rem' }}>
              <ConsultantCardMobile consultant={project.consultant} />
            </div>
          </div>

          {/* Tiện Ích */}
          {((project.features && project.features.length > 0) || project.featuresContent) && (
            <div id="tien-ich" className="project-content-section">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Tiện ích dự án {project.title}</h2>
              {project.featuresContent && (
                <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                  <PortableText value={project.featuresContent} components={portableTextComponents} />
                </div>
              )}
              {project.features && project.features.length > 0 && (
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', listStyle: 'none', padding: 0 }}>
                  {project.features.map((feature: string, index: number) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ color: '#E5C158' }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Mặt bằng */}
          {((project.floorPlans && project.floorPlans.length > 0) || project.floorPlanContent) && (
            <div id="mat-bang" className="project-content-section">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Mặt bằng dự án {project.title}</h2>
              
              {project.floorPlanContent && (
                <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)', marginBottom: (project.floorPlans && project.floorPlans.length > 0) ? '2rem' : '0' }}>
                  <PortableText value={project.floorPlanContent} components={portableTextComponents} />
                </div>
              )}

              {project.floorPlans && project.floorPlans.length > 0 && (
                <ProjectGallery images={project.floorPlans} />
              )}
            </div>
          )}

          {/* Thiết kế */}
          {project.designContent && (
            <div id="thiet-ke" className="project-content-section">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Thiết kế dự án {project.title}</h2>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
                <PortableText value={project.designContent} components={portableTextComponents} />
              </div>
            </div>
          )}

          {/* Nhà mẫu */}
          {project.showroomContent && (
            <div id="nha-mau" className="project-content-section">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Nhà mẫu dự án {project.title}</h2>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
                <PortableText value={project.showroomContent} components={portableTextComponents} />
              </div>
            </div>
          )}

          {/* Tour 360 */}
          {project.tour360Url && (
            <div id="tour-360" className="project-content-section">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Trải nghiệm Tour 360° dự án {project.title}</h2>
              <Tour360Facade url={project.tour360Url} title={project.title} imageUrl={project.imageUrl} />
            </div>
          )}

          {/* Tiến độ */}
          {project.progressContent && (
            <div id="tien-do" className="project-content-section">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Tiến độ xây dựng dự án {project.title}</h2>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
                <PortableText value={project.progressContent} components={portableTextComponents} />
              </div>
            </div>
          )}

          {/* Tại sao nên đầu tư */}
          {project.investmentReasons && (
            <div id="tai-sao-dau-tu" className="project-content-section">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Tại sao nên đầu tư dự án {project.title}?</h2>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
                <PortableText value={project.investmentReasons} components={portableTextComponents} />
              </div>
            </div>
          )}

          {/* Q&A */}
          <ProjectFAQ faqs={project.faqs} />

          {/* Multiple Developers Section */}
          {(project.developers?.length > 0) ? (
            <div id="chu-dau-tu" className="project-section" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 15px var(--shadow-color)' }}>
              <h2 className="section-title" style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Đơn vị Phát triển & Chủ đầu tư
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {project.developers.map((dev: any, idx: number) => (
                  <Link key={idx} href={`/chu-dau-tu/${dev.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={dev.logoUrl} alt={dev.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{dev.name}</h3>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Xem chi tiết &rarr;</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : project.developer && (
            <Link href={`/chu-dau-tu/${project.developer.slug}`} id="chu-dau-tu" className="project-section" style={{ display: 'flex', alignItems: 'center', gap: '2rem', background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 15px var(--shadow-color)', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: '150px', height: '150px', background: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={project.developer.logoUrl} alt={project.developer.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chủ Đầu Tư: {project.developer.name}</h3>
                <div style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>Xem chi tiết &rarr;</div>
              </div>
            </Link>
          )}

          {/* Mortgage Calculator */}
          <MortgageCalculator />

        </div>

        {/* CỘT PHẢI: Consultant Sidebar Sticky (Ẩn trên Mobile) */}
        <div className="desktop-only" style={{ position: 'sticky', top: '90px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {project.consultant ? (
            <ConsultantSidebar consultant={project.consultant} />
          ) : (
            <div style={{ background: 'var(--color-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              Chưa có thông tin chuyên viên.
            </div>
          )}

          {/* Form Đăng ký */}
          <div style={{ background: 'var(--color-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Đăng Ký Nhận Bảng Giá</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input aria-label="Họ và tên" type="text" placeholder="Họ và tên" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }} />
              <input aria-label="Số điện thoại" type="tel" placeholder="Số điện thoại" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }} />
              <button type="button" className="btn" style={{ padding: '0.8rem', fontSize: '1rem', marginTop: '0.5rem' }}>Gửi Yêu Cầu</button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav consultant={project.consultant} projectName={project.title} />
    </article>
    </>
  );
}
