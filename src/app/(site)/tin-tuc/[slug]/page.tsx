import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import NewsCard from '@/components/NewsCard';
import ProjectCard from '@/components/ProjectCard';
import ShareButtons from '@/components/ShareButtons';
import ArticleTranslator from '@/components/ArticleTranslator';
import { client } from '../../../../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import urlBuilder from '@sanity/image-url';

const builder = urlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getPlainText(block: any) {
  if (!block || !block.children) return '';
  return block.children.map((child: any) => child.text).join('');
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <img
          alt={value.alt || 'Hình ảnh minh họa'}
          loading="lazy"
          src={urlFor(value).width(900).fit('max').auto('format').url()}
          style={{ width: '100%', borderRadius: '8px', margin: '2rem 0' }}
        />
      );
    },
    imageGrid: ({ value }: any) => {
      if (!value?.images || value.images.length < 2) return null;
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '2rem 0' }}>
          {value.images.map((img: any, idx: number) => {
            if (!img?.asset?._ref) return null;
            return (
              <img
                key={idx}
                alt={img.alt || `Hình ảnh ${idx + 1}`}
                loading="lazy"
                src={urlFor(img).width(600).fit('max').auto('format').url()}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
              />
            );
          })}
        </div>
      );
    },
    table: ({ value }: any) => {
      if (!value || !value.rows || value.rows.length === 0) return null;
      const [head, ...rows] = value.rows;
      return (
        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', marginBottom: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
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
                    <td key={j} style={{ padding: '12px 16px', color: 'var(--color-text)' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
  block: {
    normal: ({ children }: any) => <p style={{ marginBottom: '1.2rem', lineHeight: '1.8', fontSize: '1.15rem', color: 'var(--color-text)', textAlign: 'justify' }}>{children}</p>,
    h2: ({ children, value }: any) => {
      const id = slugify(getPlainText(value));
      return <h2 id={id} style={{ fontSize: '1.8rem', marginTop: '1.5rem', marginBottom: '1.2rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '-0.5px' }}>{children}</h2>;
    },
    h3: ({ children, value }: any) => {
      const id = slugify(getPlainText(value));
      return <h3 id={id} style={{ fontSize: '1.4rem', marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--foreground)', fontWeight: 600 }}>{children}</h3>;
    },
    blockquote: ({ children }: any) => <blockquote style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '2rem', fontStyle: 'italic', color: 'var(--color-text-muted)', margin: '2rem 0', fontSize: '1.35rem', lineHeight: '1.6', background: 'rgba(212,175,55,0.05)', padding: '1.5rem 1.5rem 1.5rem 2rem', borderRadius: '0 8px 8px 0' }}>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', marginBottom: '1.5rem', color: 'var(--color-text)', fontSize: '1.15rem' }}>{children}</ul>,
    number: ({ children }: any) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', marginBottom: '1.5rem', color: 'var(--color-text)', fontSize: '1.15rem' }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>{children}</li>,
    number: ({ children }: any) => <li style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>{children}</li>,
  },

  marks: {
    strong: ({ children }: any) => <strong style={{ color: 'var(--foreground)', fontWeight: 700 }}>{children}</strong>,
    link: ({ children, value }: any) => <a href={value.href} style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-primary)', transition: 'all 0.3s' }}>{children}</a>,
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
  const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0] {
    title, excerpt, "imageUrl": imageUrl.asset->url, seo { seoTitle, seoDescription, seoKeywords, "seoImageUrl": seoImage.asset->url }
  }`, { slug });

  if (!post) return {};

  const title = post.seo?.seoTitle || post.title || 'Tin Tức';
  const description = post.seo?.seoDescription || post.excerpt || 'Đọc tin tức mới nhất từ Trien BDS.';
  const image = post.seo?.seoImageUrl || post.imageUrl;

  return {
    title,
    description,
    keywords: post.seo?.seoKeywords,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `https://www.dautubds.io.vn/tin-tuc/${slug}`,
    },
  };
}

export const revalidate = 60;

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id, title, excerpt, content, "date": coalesce(date, _createdAt), viewCount, "imageUrl": imageUrl.asset->url + "?w=1200&fit=max&auto=format",
    author->{name, "avatarUrl": image.asset->url + "?w=400&fit=max&auto=format", bio, isVerified},
    "relatedPosts": relatedPosts[]->{
      title,
      "slug": slug.current,
      "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format",
      "date": coalesce(date, _createdAt),
      excerpt
    },
    "relatedProjects": relatedProjects[]->{
      title,
      "slug": slug.current,
      "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format",
      price,
      location,
      status,
      category
    }
  }`;

  const article = await client.fetch(query, { slug });

  if (!article) {
    notFound();
  }

  const formattedDate = article.date ? new Date(article.date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  // Tính toán thời gian đọc (khoảng 250 từ/phút)
  const fullText = article.content?.map(getPlainText).join(' ') || '';
  const wordCount = fullText.split(/\s+/).filter((w: string) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 250));

  // Trích xuất Mục lục (TOC)
  const headings = article.content?.filter((block: any) => block._type === 'block' && (block.style === 'h2' || block.style === 'h3')) || [];
  const toc = headings.map((heading: any) => {
    const text = getPlainText(heading);
    return {
      text,
      id: slugify(text),
      level: heading.style === 'h2' ? 2 : 3
    };
  });

  // Khai báo Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://www.dautubds.io.vn' },
      { '@type': 'ListItem', position: 2, name: 'Tin tức', item: 'https://www.dautubds.io.vn/tin-tuc' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://www.dautubds.io.vn/tin-tuc/${slug}` },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: article.imageUrl ? [article.imageUrl] : [],
    datePublished: article.date ? new Date(article.date).toISOString() : new Date().toISOString(),
    author: [{
        '@type': 'Person',
        name: article.author?.name || 'Trien BDS',
        url: 'https://www.dautubds.io.vn'
      }]
  };

  return (
    <article className="container section" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem', background: 'var(--background)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} suppressHydrationWarning />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} suppressHydrationWarning />
      
      <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', transition: 'color 0.2s' }}>Trang chủ</Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>/</span>
        <Link href="/tin-tuc" style={{ color: 'var(--color-primary)', textDecoration: 'none', transition: 'color 0.2s' }}>Tin tức</Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>/</span>
        <span style={{ color: 'var(--foreground)' }} title={article.title}>{article.title}</span>
      </div>
      
      <ArticleTranslator />
      
      <header style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: '1.5rem', lineHeight: '1.3', letterSpacing: '-0.5px', fontWeight: 700, color: 'var(--foreground)' }}>
          {article.title}
        </h1>
        
        {/* Meta Info Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-primary)' }}>👤</span>
            <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{article.author?.name || 'Ban biên tập'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⏱️</span>
            <span>{readTime} phút đọc</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👁️</span>
            <span>{article.viewCount || Math.floor(Math.random() * 50 + 50)} lượt xem</span>
          </div>
        </div>
      </header>

      {article.imageUrl && (
        <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '500px', borderRadius: '12px', overflow: 'hidden', marginBottom: '3rem' }}>
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}

      {/* Table of Contents */}
      {toc.length > 0 && (
        <details style={{ background: 'var(--color-dark-light)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <summary style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📑</span> Mục lục bài viết ({toc.length} mục)
            </div>
          </summary>
          <ul style={{ marginTop: '1rem', listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {toc.map((item: any, idx: number) => (
              <li key={idx} style={{ paddingLeft: item.level === 3 ? '1rem' : '0' }}>
                <a href={`#${item.id}`} style={{ color: item.level === 2 ? 'var(--color-primary)' : 'var(--color-text-muted)', textDecoration: 'none', fontSize: item.level === 2 ? '1rem' : '0.9rem', fontWeight: item.level === 2 ? 600 : 400, transition: 'color 0.2s' }}>
                  {item.level === 2 ? `${idx + 1}. ` : '› '} {item.text}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--color-text)' }}>
        {article.excerpt && (
          <p style={{ fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--color-text-muted)', borderLeft: '4px solid var(--color-primary)', paddingLeft: '1.5rem', marginBottom: '3rem', lineHeight: '1.8' }}>
            {article.excerpt}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {article.content ? (
            <PortableText value={article.content} components={portableTextComponents} />
          ) : (
            <p>Nội dung đang được cập nhật...</p>
          )}
        </div>
      </div>

      {article.author && (
        <div style={{ 
          marginTop: '4rem', 
          padding: '2rem', 
          background: 'var(--color-secondary)', 
          borderRadius: '12px',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {article.author.avatarUrl ? (
            <img 
              src={article.author.avatarUrl} 
              alt={article.author.name} 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
            />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', flexShrink: 0 }}>
              {article.author.name.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--foreground)' }}>{article.author.name}</h4>
              {article.author.isVerified && (
                <span title="Tác giả đã xác thực" style={{ color: '#1877F2', display: 'flex' }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"></path>
                  </svg>
                </span>
              )}
            </div>
            {article.author.bio && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
                {article.author.bio}
              </p>
            )}
          </div>
        </div>
      )}

      <ShareButtons url={`https://www.dautubds.io.vn/tin-tuc/${slug}`} title={article.title} />

      {article.relatedProjects && article.relatedProjects.length > 0 && (
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏢</span> Dự án liên quan
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {article.relatedProjects.map((project: any, index: number) => (
              <a href={`/du-an/${project.slug}`} key={index} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--color-secondary)', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <img src={project.imageUrl} alt={project.title} style={{ width: '90px', height: '90px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 0.3rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.title}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.4rem' }}>{project.location}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E53E3E' }}>{project.price}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {article.relatedPosts && article.relatedPosts.length > 0 && (
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', textAlign: 'left', fontWeight: 700 }}>Bài Viết <span style={{ color: 'var(--color-primary)' }}>Liên Quan</span></h3>
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {article.relatedPosts.map((relatedPost: any) => (
              <NewsCard key={relatedPost._id} article={relatedPost} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
