import { client } from '../../../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const pageData = await client.fetch(`*[_type == "page" && slug.current == $slug][0]{
    title,
    content
  }`, { slug });

  if (!pageData) {
    return notFound();
  }

  const portableTextComponents = {
    types: {
      image: ({ value }: any) => {
        return (
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <img src={value.asset.url} alt={value.alt || 'Hình ảnh'} style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        );
      },
      youtube: ({ value }: any) => {
        const { url } = value;
        const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        if (!id) return null;
        return (
          <div className="pt-image" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', margin: '2rem 0', borderRadius: '8px' }}>
            <iframe 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={`https://www.youtube.com/embed/${id}`} 
              frameBorder="0" allowFullScreen
            />
          </div>
        );
      },
    },
    block: {
      h1: ({ children }: any) => <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', marginTop: '2rem', color: 'var(--color-primary)' }}>{children}</h1>,
      h2: ({ children }: any) => <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', marginTop: '2rem' }}>{children}</h2>,
      h3: ({ children }: any) => <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', marginTop: '1.5rem' }}>{children}</h3>,
      normal: ({ children }: any) => <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem', textAlign: 'justify' }}>{children}</p>,
      blockquote: ({ children }: any) => <blockquote style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '1rem', fontStyle: 'italic', margin: '1.5rem 0', background: 'rgba(255,255,255,0.05)', padding: '1rem' }}>{children}</blockquote>,
    },
    list: {
      bullet: ({ children }: any) => <ul style={{ listStyleType: 'disc', paddingLeft: '2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>{children}</ul>,
      number: ({ children }: any) => <ol style={{ listStyleType: 'decimal', paddingLeft: '2rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>{children}</ol>,
    },
    listItem: {
      bullet: ({ children }: any) => <li style={{ marginBottom: '0.5rem' }}>{children}</li>,
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '900px' }}>
      <div className="project-content-section" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginTop: 0 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center', color: 'var(--foreground)' }}>
          {pageData.title}
        </h1>
        <div style={{ height: '2px', background: 'var(--color-primary)', width: '60px', margin: '0 auto 3rem auto' }}></div>
        
        <div className="portable-content" style={{ color: 'var(--color-text-muted)' }}>
          {pageData.content ? (
            <PortableText value={pageData.content} components={portableTextComponents} />
          ) : (
            <p style={{ textAlign: 'center' }}>Nội dung đang được cập nhật...</p>
          )}
        </div>
      </div>
    </div>
  );
}
