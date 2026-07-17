'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.css';

export default function Navbar({ config }: { config?: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav style={{ position: 'relative' }}>
      <div className={`container-wide ${styles.navbar}`}>
        <div className={styles.mobileLeft}>
          <ThemeToggle />
        </div>
        <Link href="/" className={styles.logo}>
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt={config?.siteName || "Logo"} style={{ height: '40px', objectFit: 'contain' }} />
          ) : (
            <>DAUTU<span className={styles.logoHighlight}>BDS</span></>
          )}
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Trang chủ</Link></li>
          <li><Link href="/du-an">Dự án</Link></li>
          <li><Link href="/chu-dau-tu">Chủ đầu tư</Link></li>
          <li><Link href="/tin-tuc">Tin tức</Link></li>
          <li><Link href="/lien-he">Liên hệ</Link></li>
        </ul>
        <div className={styles.rightSection}>
          <div className={styles.desktopThemeToggle}>
            <ThemeToggle />
          </div>
          <Link href="/lien-he" className={`btn btn-outline ${styles.contactBtn}`}>Tư vấn ngay</Link>
          <button aria-label="Mở menu" className={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileNavLinks}>
            <li><Link href="/" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link></li>
            <li><Link href="/du-an" onClick={() => setIsMenuOpen(false)}>Dự án</Link></li>
            <li><Link href="/chu-dau-tu" onClick={() => setIsMenuOpen(false)}>Chủ đầu tư</Link></li>
            <li><Link href="/tin-tuc" onClick={() => setIsMenuOpen(false)}>Tin tức</Link></li>
            <li><Link href="/lien-he" onClick={() => setIsMenuOpen(false)}>Liên hệ</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
}
