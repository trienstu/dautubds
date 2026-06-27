import NewsCard from '@/components/NewsCard';
import { client } from '../../../../sanity/lib/client';

export const revalidate = 60;

export default async function NewsPage() {
  const query = `*[_type == "post"] | order(coalesce(date, _createdAt) desc) {
    "id": _id, title, "slug": slug.current, excerpt, "date": coalesce(date, _createdAt), "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format"
  }`;
  
  const news = await client.fetch(query);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)' }}>
          Tin Tức <span className="text-primary">Thị Trường</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Cập nhật những thông tin mới nhất về thị trường bất động sản, xu hướng đầu tư và các dự án hot nhất.
        </p>
      </div>

      {news.length > 0 ? (
        <div className="grid-3">
          {news.map((article: any) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center" style={{ padding: '5rem 0', color: 'var(--color-text-muted)' }}>
          <p>Chưa có bài viết nào được đăng.</p>
        </div>
      )}
    </div>
  );
}
