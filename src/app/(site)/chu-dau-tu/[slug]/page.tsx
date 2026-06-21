import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '../../../../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import urlBuilder from '@sanity/image-url';
import Link from 'next/link';

const builder = urlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null;
      return (
        <img
          alt={value.alt || 'Hình ảnh'}
          loading="lazy"
          src={urlFor(value).width(800).fit('max').auto('format').url()}
          style={{ width: '100%', borderRadius: '8px', margin: '2rem 0' }}
        />
      );
    },
    youtube: ({ value }: any) => {
      const { url } = value;
      const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      if (!id) return null;
      return (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', margin: '2rem 0', borderRadius: '8px' }}>
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src={`https://www.youtube.com/embed/${id}`} 
            frameBorder="0" allowFullScreen
          />
        </div>
      );
    }
  },
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const developer = await client.fetch(`*[_type == "developer" && slug.current == $slug][0]{
    name, "logoUrl": logo.asset->url, seo { seoTitle, seoDescription, seoKeywords, "seoImageUrl": seoImage.asset->url }
  }`, { slug });

  if (!developer) return {};

  const title = developer.seo?.seoTitle || `Chủ Đầu Tư ${developer.name}`;
  const description = developer.seo?.seoDescription || `Tìm hiểu thông tin chi tiết và danh sách dự án của Chủ đầu tư ${developer.name}.`;
  const image = developer.seo?.seoImageUrl || developer.logoUrl;

  return {
    title,
    description,
    keywords: developer.seo?.seoKeywords,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `https://dautubds.io.vn/chu-dau-tu/${slug}`,
    },
  };
}

export const revalidate = 60;

export default async function DeveloperDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const query = `*[_type == "developer" && slug.current == $slug][0] {
    _id, name, description, "logoUrl": logo.asset->url + "?w=400&fit=max&auto=format",
    "projects": *[_type == "project" && developer._ref == ^._id] {
      _id, title, "slug": slug.current, location, price, "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format"
    }
  }`;
  
  const developer = await client.fetch(query, { slug });

  if (!developer) notFound();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://dautubds.io.vn' },
      { '@type': 'ListItem', position: 2, name: 'Chủ đầu tư', item: 'https://dautubds.io.vn/chu-dau-tu' },
      { '@type': 'ListItem', position: 3, name: developer.name, item: `https://dautubds.io.vn/chu-dau-tu/${slug}` },
    ],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: developer.name,
    image: developer.logoUrl,
    url: `https://dautubds.io.vn/chu-dau-tu/${slug}`
  };

  return (
    <article style={{ paddingTop: '5rem', paddingBottom: '5rem', background: 'var(--background)', color: 'var(--foreground)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', background: 'var(--color-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '150px', height: '150px', background: 'white', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={developer.logoUrl} alt={developer.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{developer.name}</h1>
            <span style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600 }}>Chủ đầu tư uy tín</span>
          </div>
        </div>

        {developer.description ? (
          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-text-muted)', marginBottom: '4rem' }}>
            <PortableText value={developer.description} components={portableTextComponents} />
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '4rem' }}>Đang cập nhật thông tin giới thiệu về chủ đầu tư này.</p>
        )}

        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '1rem', display: 'inline-block' }}>Dự án đang triển khai</h2>
        
        {developer.projects && developer.projects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {developer.projects.map((proj: any) => (
              <Link href={`/du-an/${proj.slug}`} key={proj._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'var(--color-secondary)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', transition: 'transform 0.3s' }}>
                  <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                    <img src={proj.imageUrl} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>{proj.title}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>📍 {proj.location || 'Đang cập nhật'}</p>
                    <div style={{ color: '#3b82f6', fontWeight: 600 }}>{proj.price || 'Đang cập nhật'}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>Chưa có dự án nào được cập nhật cho chủ đầu tư này.</p>
        )}
      </div>
    </article>
  );
}
