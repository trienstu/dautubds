import ProjectCard from '@/components/ProjectCard';
import ProjectSearch from '@/components/ProjectSearch';
import { client } from '../../../../../sanity/lib/client';
import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { removeAccents } from '@/utils/stringUtils';

export const revalidate = 60;

const categoryMap: Record<string, string> = {
  'biet-thu': 'Biệt thự',
  'nha-pho': 'Nhà phố',
  'can-ho': 'Căn hộ',
  'dat-nen': 'Đất nền',
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const provinceData = await client.fetch(`*[_type == "province" && slug.current == $slug][0]{ title }`, { slug });
  
  if (!provinceData) return {};
  
  const pageTitle = `Dự Án Tại ${provinceData.title}`;
  
  return {
    title: pageTitle,
    description: `Danh sách các dự án bất động sản đẳng cấp tại ${provinceData.title}.`,
    alternates: {
      canonical: `https://www.dautubds.io.vn/khu-vuc/${slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: `Danh sách các dự án bất động sản đẳng cấp tại ${provinceData.title}.`,
      url: `https://www.dautubds.io.vn/khu-vuc/${slug}`,
      type: 'website',
    },
  };
}

export default async function ProvinceProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ category?: string, q?: string, status?: string }>
}) {
  const { slug } = await params;
  const { category, q, status } = await searchParams;
  
  const provinceData = await client.fetch(`*[_type == "province" && slug.current == $slug][0]{ title, "slug": slug.current }`);
  
  if (!provinceData) {
    return notFound();
  }

  const categoryLabel = category && categoryMap[category as string] ? categoryMap[category as string] : category;

  // Fetch all projects for this province
  const query = `*[_type == "project" && province->slug.current == $slug] | order(_createdAt desc) {
    "id": _id, title, "slug": slug.current, category, price, location, 
    "provinceSlug": province->slug.current, status, 
    "imageUrl": imageUrl.asset->url + "?w=1200&fit=max&auto=format"
  }`;
  let projects = await client.fetch(query, { slug });

  // Fetch all provinces for the dropdown (so users can switch provinces easily)
  const provinces = await client.fetch(`*[_type == "province"] | order(order asc) { title, "slug": slug.current }`);

  // JS Filters
  if (categoryLabel && categoryLabel !== 'Tất cả') {
    projects = projects.filter((p: any) => p.category === categoryLabel);
  }

  if (status) {
    projects = projects.filter((p: any) => p.status === status);
  }

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
            {q ? `Kết quả tìm kiếm cho "${q}" tại ${provinceData.title}` : `Dự Án Tại ${provinceData.title}`}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Khám phá danh sách các dự án bất động sản đẳng cấp tại {provinceData.title}, được tuyển chọn kỹ lưỡng để mang lại giá trị sống và cơ hội đầu tư tốt nhất.
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
          <p>Không tìm thấy dự án nào trong khu vực này.</p>
        </div>
      )}
    </div>
  );
}
