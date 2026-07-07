import ProjectCard from '@/components/ProjectCard';
import { client } from '../../../../sanity/lib/client';
import type { Metadata } from 'next';

export const revalidate = 60;

const categoryMap: Record<string, string> = {
  'biet-thu': 'Biệt thự',
  'nha-pho': 'Nhà phố',
  'can-ho': 'Căn hộ',
  'dat-nen': 'Đất nền',
};

const categories = [
  { slug: 'tat-ca', label: 'Tất cả' },
  { slug: 'biet-thu', label: 'Biệt thự' },
  { slug: 'nha-pho', label: 'Nhà phố' },
  { slug: 'can-ho', label: 'Căn hộ' },
  { slug: 'dat-nen', label: 'Đất nền' },
];

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string }> }): Promise<Metadata> {
  const { category } = await searchParams;
  const config = await client.fetch(`*[_type == "siteConfig"][0]{
    projectsSeo {
      seoTitle,
      seoDescription,
      seoKeywords,
      "seoImageUrl": seoImage.asset->url
    }
  }`);
  
  const seo = config?.projectsSeo || {};
  const categoryLabel = category && categoryMap[category] ? categoryMap[category] : '';
  const pageTitle = categoryLabel ? categoryLabel : (seo.seoTitle || 'Danh Sách Dự Án');

  return {
    title: pageTitle,
    description: seo.seoDescription || 'Khám phá các dự án bất động sản hạng sang từ Trien BDS.',
    keywords: seo.seoKeywords || '',
    alternates: { canonical: 'https://www.dautubds.io.vn/du-an' },
    openGraph: {
      title: pageTitle,
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
  const categoryLabel = category && categoryMap[category] ? categoryMap[category] : category;
  
  const queryConditions = ['_type == "project"'];
  
  if (categoryLabel && categoryLabel !== 'Tất cả') {
    queryConditions.push(`category == $categoryLabel`);
  }
  
  if (q) {
    queryConditions.push(`(title match $q + "*" || location match $q + "*")`);
  }
  
  const query = `*[${queryConditions.join(' && ')}] | order(_createdAt desc) {
    "id": _id, title, "slug": slug.current, category, price, location, "imageUrl": imageUrl.asset->url + "?auto=format", status
  }`;

  const projects = await client.fetch(query, { categoryLabel, q });

  return (
    <div className="container section">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)' }}>
          {q ? `Kết quả tìm kiếm cho "${q}"` : (categoryLabel ? categoryLabel : 'Tất Cả Dự Án')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Khám phá danh sách các dự án bất động sản đẳng cấp, được tuyển chọn kỹ lưỡng để mang lại giá trị sống và cơ hội đầu tư tốt nhất.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {categories.map(cat => {
          const isActive = (cat.slug === 'tat-ca' && !category) || cat.slug === category;
          const href = cat.slug === 'tat-ca' ? '/du-an' : `/du-an?category=${cat.slug}`;
          return (
            <a 
              key={cat.slug} 
              href={href}
              className={isActive ? 'btn' : 'btn btn-outline'}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '50px' }}
            >
              {cat.label}
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
