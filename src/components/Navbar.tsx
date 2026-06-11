import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.css';

export default function Navbar({ config }: { config?: any }) {
  return (
    <nav>
      <div className={`container ${styles.navbar}`}>
        <Link href="/" className={styles.logo}>
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt={config?.siteName || "Logo"} style={{ height: '40px', objectFit: 'contain' }} />
          ) : (
            <>LUX<span className="text-primary">ESTATE</span></>
          )}
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Trang chủ</Link></li>
          <li><Link href="/du-an">Dự án</Link></li>
          <li><Link href="/tin-tuc">Tin tức</Link></li>
          <li><Link href="/lien-he">Liên hệ</Link></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <Link href="/lien-he" className="btn btn-outline">Tư vấn ngay</Link>
        </div>
      </div>
    </nav>
  );
}
