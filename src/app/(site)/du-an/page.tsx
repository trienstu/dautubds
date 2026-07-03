import ProjectCard from '@/components/ProjectCard';
import { client } from '../../../../sanity/lib/client';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await client.fetch(`*[_type == "siteConfig"][0]{
    projectsSeo {
      seoTitle,
      seoDescription,
      seoKeywords,
      "seoImageUrl": seoImage.asset->url
    }
  }`);
  
  const seo = config?.projectsSeo || {};
  return {
    title: seo.seoTitle || 'Danh Sách Dự Án | Trien BDS',
    description: seo.seoDescription || 'Khám phá các dự án bất động sản hạng sang từ Trien BDS.',
    keywords: seo.seoKeywords || '',
    alternates: { canonical: 'https://www.dautubds.io.vn/du-an' },
    openGraph: {
      title: seo.seoTitle || 'Danh Sách Dự Án | Trien BDS',
      description: seo.seoDescription || 'Khám phá các dự án bất động sản hạng sang từ Trien BDS.',
      url: 'https://www.dautubds.io.vn/du-an',
      type: 'website',
      images: seo.seoImageUrl ? [{ url: seo.seoImageUrl }] : [],
    },
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, q?: string }>
}) {
  const { category, q } = await searchParams;
  
  const queryConditions = ['_type == "project"'];
  
  if (category && category !== 'Tất cả') {
    queryConditions.push(`category == $category`);
  }
  
  if (q) {
    queryConditions.push(`(title match $q + "*" || location match $q + "*")`);
  }
  
  const query = `*[${queryConditions.join(' && ')}] | order(_createdAt desc) {
    "id": _id, title, "slug": slug.current, category, price, location, "imageUrl": imageUrl.asset->url + "?w=800&fit=max&auto=format", status
  }`;

  const projects = await client.fetch(query, { category, q });

  return (
    <div className="container section">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)' }}>
          {q ? `Kết quả tìm kiếm cho "${q}"` : (category ? `Dự Án ${category}` : 'Tất Cả Dự Án')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Khám phá danh sách các dự án bất động sản đẳng cấp, được tuyển chọn kỹ lưỡng để mang lại giá trị sống và cơ hội đầu tư tốt nhất.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {['Tất cả', 'Biệt thự', 'Nhà phố', 'Căn hộ', 'Đất nền'].map(cat => {
          const isActive = (cat === 'Tất cả' && !category) || cat === category;
          const href = cat === 'Tất cả' ? '/du-an' : `/du-an?category=${cat}`;
          return (
            <a 
              key={cat} 
              href={href}
              className={isActive ? 'btn' : 'btn btn-outline'}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '50px' }}
            >
              {cat}
            </a>
          );
        })}
      </div>

      {projects.length > 0 ? (
        <div className="grid-3">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center" style={{ padding: '5rem 0', color: 'var(--color-text-muted)' }}>
          <p>Không tìm thấy dự án nào trong danh mục này.</p>
        </div>
      )}
    </div>
  );
}
