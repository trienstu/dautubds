'use client';

import { usePathname } from 'next/navigation';
import styles from './FloatingContact.module.css';

export default function FloatingContact() {
  const phoneNumber = '0919741414';
  const pathname = usePathname();
  const isProjectDetail = pathname?.startsWith('/du-an/');

  return (
    <div className={`${styles.floatingContainer} ${isProjectDetail ? styles.hideOnMobile : ''}`}>
      {/* Nút Zalo */}
      <a 
        href={`https://zalo.me/${phoneNumber}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${styles.actionButton} ${styles.zaloBtn}`}
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" 
          alt="Zalo" 
        />
        <span className={styles.tooltip}>Chat Zalo</span>
      </a>

      {/* Nút Gọi Điện */}
      <a 
        href={`tel:${phoneNumber}`} 
        className={`${styles.actionButton} ${styles.callBtn}`}
      >
        📞
        <span className={styles.tooltip}>{phoneNumber}</span>
      </a>
    </div>
  );
}
