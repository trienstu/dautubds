import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import ThemeProvider from "@/components/ThemeProvider";
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
  title: "Website BĐS",
  description: "Trang web bất động sản cao cấp",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
