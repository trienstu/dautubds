import ProjectCard from '@/components/ProjectCard';
import ProjectSearch from '@/components/ProjectSearch';
import { client } from '../../../../sanity/lib/client';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { removeAccents } from '@/utils/stringUtils';

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
  searchParams: Promise<{ category?: string, q?: string, province?: string, status?: string }>
}) {
  const { category, q, province, status } = await searchParams;
  const categoryLabel = category && categoryMap[category as string] ? categoryMap[category as string] : category;

  // Fetch all projects (including expanded province reference)
  const query = `*[_type == "project"] | order(_createdAt desc) {
    "id": _id, title, "slug": slug.current, category, price, location, 
    "provinceSlug": province->slug.current, status, 
    "imageUrl": imageUrl.asset->url + "?w=1200&fit=max&auto=format"
  }`;
  let projects = await client.fetch(query);

  // Fetch all provinces for the dropdown
  const provinces = await client.fetch(`*[_type == "province"] | order(order asc) { title, "slug": slug.current }`);

  // Filter by category
  if (categoryLabel && categoryLabel !== 'Tất cả') {
    projects = projects.filter((p: any) => p.category === categoryLabel);
  }

  // Filter by province
  if (province) {
    projects = projects.filter((p: any) => p.provinceSlug === province);
  }

  // Filter by status
  if (status) {
    projects = projects.filter((p: any) => p.status === status);
  }

  // Filter by search query (diacritic-insensitive)
  if (q) {
    const normalizedQ = removeAccents((q as string).toLowerCase());
    projects = projects.filter((p: any) => {
      const title = removeAccents((p.title || '').toLowerCase());
      const loc = removeAccents((p.location || '').toLowerCase());
      return title.includes(normalizedQ) || loc.includes(normalizedQ);
    });
  }

  return (
    <div className="container page-header-container">
      <div className="page-header-top">
        <div className="page-header-title-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="page-title-stylish">
            {q ? `Kết quả tìm kiếm cho "${q}"` : (categoryLabel ? categoryLabel : 'Tất Cả Dự Án')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Khám phá danh sách các dự án bất động sản đẳng cấp, được tuyển chọn kỹ lưỡng để mang lại giá trị sống và cơ hội đầu tư tốt nhất.
          </p>
        </div>

        <div className="page-header-search-section">
          <Suspense fallback={<div style={{ height: '60px' }}></div>}>
            <ProjectSearch provinces={provinces} />
          </Suspense>
        </div>
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
