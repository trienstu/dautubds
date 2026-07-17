import type { Metadata } from 'next';
import Link from 'next/link';
import { client } from '../../../../sanity/lib/client';
import styles from './page.module.css';
import DeveloperListClient from '@/components/DeveloperListClient';

export const metadata: Metadata = {
  title: 'Khám phá các Chủ đầu tư Uy tín',
  description: 'Tìm hiểu về các nhà phát triển dự án hàng đầu, từ kinh nghiệm, quy mô cho đến những dự án tiêu biểu.',
  openGraph: {
    type: 'website',
    title: 'Khám phá các Chủ đầu tư Uy tín',
    description: 'Tìm hiểu về các nhà phát triển dự án hàng đầu, từ kinh nghiệm, quy mô cho đến những dự án tiêu biểu.',
  },
};

export const revalidate = 60;

export default async function DevelopersPage() {
  const developers = await client.fetch(`*[_type == "developer"] | order(isFeatured desc, order asc, _createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    "logoUrl": logo.asset->url,
    location,
    foundedYear,
    country,
    isFeatured,
    description,
    "projectCount": count(*[_type == "project" && (developer._ref == ^._id || ^._id in developers[]._ref)])
  }`);

  return (
    <div className={styles.container}>
      <DeveloperListClient initialDevelopers={developers} />
    </div>
  );
}
