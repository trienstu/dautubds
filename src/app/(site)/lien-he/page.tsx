import React from 'react';
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Liên Hệ',
  description: 'Liên hệ với Trien BDS Luxury Real Estate để được tư vấn bất động sản hạng sang.',
  alternates: {
    canonical: 'https://www.dautubds.io.vn/lien-he',
  },
  openGraph: {
    title: 'Liên Hệ - Trien BDS Luxury Real Estate',
    description: 'Liên hệ với chúng tôi để được tư vấn bất động sản hạng sang.',
    url: 'https://www.dautubds.io.vn/lien-he',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
