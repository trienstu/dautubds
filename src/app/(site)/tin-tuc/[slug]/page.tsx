import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import NewsCard from '@/components/NewsCard';
import { client } from '../../../../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import urlBuilder from '@sanity/image-url';

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
          alt={value.alt || 'Hình ảnh minh họa'}
          loading="lazy"
          src={urlFor(value).width(800).fit('max').auto('format').url()}
          style={{ width: '100%', borderRadius: '8px', margin: '2rem 0' }}
        />
      );
    },
  },
  block: {
    normal: ({ children }: any) => <p style={{ marginBottom: '1.2rem', lineHeight: '1.6', fontSize: '1.15rem', color: '#d1d1d1', textAlign: 'justify' }}>{children}</p>,
    h2: ({ children }: any) => <h2 style={{ fontSize: '2.2rem', marginTop: '3.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '-0.5px' }}>{children}</h2>,
    h3: ({ children }: any) => <h3 style={{ fontSize: '1.6rem', marginTop: '2.5rem', marginBottom: '1.2rem', color: 'var(--color-white)', fontWeight: 600 }}>{children}</h3>,
    blockquote: ({ children }: any) => <blockquote style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '2rem', fontStyle: 'italic', color: 'var(--color-text-muted)', margin: '2rem 0', fontSize: '1.35rem', lineHeight: '1.6' }}>{children}</blockquote>,
  },
  marks: {
    strong: ({ children }: any) => <strong style={{ color: 'var(--color-white)', fontWeight: 700 }}>{children}</strong>,
    link: ({ children, value }: any) => <a href={value.href} style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-primary)', transition: 'all 0.3s' }}>{children}</a>,
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
      canonical: `https://dautubds.io.vn/tin-tuc/${slug}`,
    },
  };
}

export const revalidate = 60;

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id, title, excerpt, content, date, "imageUrl": imageUrl.asset->url + "?auto=format",
    author->{name, "avatarUrl": image.asset->url + "?auto=format", bio, isVerified},
    relatedPosts[]->{_id, title, "slug": slug.current, excerpt, date, "imageUrl": imageUrl.asset->url + "?auto=format"}
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

  // Khai báo Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://dautubds.io.vn' },
      { '@type': 'ListItem', position: 2, name: 'Tin tức', item: 'https://dautubds.io.vn/tin-tuc' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://dautubds.io.vn/tin-tuc/${slug}` },
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
        url: 'https://dautubds.io.vn'
      }]
  };

  return (
    <article className="container section" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Link href="/tin-tuc" style={{ color: 'var(--color-primary)', display: 'inline-block', marginBottom: '3rem', fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        &larr; Trở về
      </Link>
      
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
          {formattedDate}
        </span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginTop: '1.5rem', marginBottom: '2rem', lineHeight: '1.2', letterSpacing: '-1px' }}>
          {article.title}
        </h1>
      </header>

      {article.imageUrl && (
        <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', marginBottom: '3rem' }}>
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}

      <div style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--color-text)' }}>
        {article.excerpt && (
          <p style={{ fontSize: '1.4rem', fontStyle: 'italic', color: '#e0e0e0', borderLeft: '4px solid var(--color-primary)', paddingLeft: '2rem', marginBottom: '3.5rem', lineHeight: '1.8' }}>
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
          background: 'var(--color-dark-light)', 
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
              <h4 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>{article.author.name}</h4>
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

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Chia sẻ bài viết:</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Facebook</button>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Zalo</button>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Copy Link</button>
        </div>
      </div>

      {article.relatedPosts && article.relatedPosts.length > 0 && (
        <div style={{ marginTop: '5rem', paddingTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginBottom: '2.5rem', fontSize: '2rem', textAlign: 'center' }}>Bài Viết <span>Liên Quan</span></h3>
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {article.relatedPosts.map((relatedPost: any) => (
              <NewsCard key={relatedPost._id} article={relatedPost} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
