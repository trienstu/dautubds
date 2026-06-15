import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import GlobalBookingModal from "@/components/GlobalBookingModal";
import ThemeProvider from "@/components/ThemeProvider";
import { GoogleAnalytics } from '@next/third-parties/google';
import { client } from "../../../sanity/lib/client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Trien BDS Luxury',
    default: 'Website Bất Động Sản Hạng Sang | Trien BDS',
  },
  description: 'Khám phá bộ sưu tập bất động sản hạng sang bậc nhất dành riêng cho giới tinh hoa.',
  metadataBase: new URL('https://dautubds.io.vn'),
  openGraph: {
    title: 'Trien BDS Luxury Real Estate',
    description: 'Định Chuẩn Sống Đẳng Cấp - Bộ sưu tập bất động sản hạng sang.',
    url: 'https://dautubds.io.vn',
    siteName: 'Trien BDS',
    locale: 'vi_VN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await client.fetch(`*[_type == "siteConfig"][0] {
    ...,
    "logoUrl": logo.asset->url
  }`);
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} suppressHydrationWarning>
        <ThemeProvider>
          <Navbar config={config} />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer config={config} />
          <FloatingContact />
          <GlobalBookingModal />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  );
}
