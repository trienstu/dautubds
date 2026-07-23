import NewsCard from '@/components/NewsCard';
import NewsSearch from '@/components/NewsSearch';
import { client } from '../../../../sanity/lib/client';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { removeAccents } from '@/utils/stringUtils';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await client.fetch(`*[_type == "siteConfig"][0]{
    newsSeo {
      seoTitle,
      seoDescription,
      seoKeywords,
      "seoImageUrl": seoImage.asset->url
    }
  }`);
  
  const seo = config?.newsSeo || {};
  return {
    title: seo.seoTitle || 'Tin Tức & Sự Kiện | Trien BDS',
    description: seo.seoDescription || 'Cập nhật tin tức thị trường và sự kiện bất động sản mới nhất.',
    keywords: seo.seoKeywords || '',
    alternates: { canonical: 'https://www.dautubds.io.vn/tin-tuc' },
    openGraph: {
      title: seo.seoTitle || 'Tin Tức & Sự Kiện | Trien BDS',
      description: seo.seoDescription || 'Cập nhật tin tức thị trường và sự kiện bất động sản mới nhất.',
      url: 'https://www.dautubds.io.vn/tin-tuc',
      type: 'website',
      images: seo.seoImageUrl ? [{ url: seo.seoImageUrl }] : [],
    },
  };
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';

  const query = `*[_type == "post"] | order(coalesce(date, _createdAt) desc) {
    "id": _id, title, "slug": slug.current, excerpt, "date": coalesce(date, _createdAt), "imageUrl": imageUrl.asset->url + "?w=1200&fit=max&auto=format"
  }`;
  
  let news = await client.fetch(query);

  if (q) {
    const normalizedQ = removeAccents(q.toLowerCase());
    news = news.filter((article: any) => {
      const title = removeAccents((article.title || '').toLowerCase());
      const excerpt = removeAccents((article.excerpt || '').toLowerCase());
      return title.includes(normalizedQ) || excerpt.includes(normalizedQ);
    });
  }

  return (
    <div className="container page-header-container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title-stylish">
          Tin Tức <span className="text-primary">Thị Trường</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Cập nhật những thông tin mới nhất về thị trường bất động sản, xu hướng đầu tư và các dự án hot nhất.
        </p>
      </div>

      <Suspense fallback={<div>Đang tải...</div>}>
        <NewsSearch />
      </Suspense>

      {news.length > 0 ? (
        <div className="grid-3">
          {news.map((article: any) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center" style={{ padding: '5rem 0', color: 'var(--color-text-muted)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Không tìm thấy kết quả nào</h3>
          <p>Rất tiếc, không có bài viết nào phù hợp với từ khóa "{q}". Vui lòng thử lại với từ khóa khác.</p>
        </div>
      )}
    </div>
  );
}
