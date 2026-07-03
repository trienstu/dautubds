import React from 'react';
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

import { client } from '../../../../sanity/lib/client';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await client.fetch(`*[_type == "siteConfig"][0]{
    contactSeo {
      seoTitle,
      seoDescription,
      seoKeywords,
      "seoImageUrl": seoImage.asset->url
    }
  }`);
  
  const seo = config?.contactSeo || {};
  return {
    title: seo.seoTitle || 'Liên Hệ | Trien BDS',
    description: seo.seoDescription || 'Liên hệ với Trien BDS Luxury Real Estate để được tư vấn bất động sản hạng sang.',
    keywords: seo.seoKeywords || '',
    alternates: { canonical: 'https://www.dautubds.io.vn/lien-he' },
    openGraph: {
      title: seo.seoTitle || 'Liên Hệ | Trien BDS',
      description: seo.seoDescription || 'Liên hệ với chúng tôi để được tư vấn bất động sản hạng sang.',
      url: 'https://www.dautubds.io.vn/lien-he',
      type: 'website',
      images: seo.seoImageUrl ? [{ url: seo.seoImageUrl }] : [],
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
