import Link from 'next/link';
import styles from './NewsCard.module.css';
import { NewsArticle } from '@/data/mockData';
import { replaceDateShortcodes } from '@/utils/dateReplace';

export default function NewsCard({ article }: { article: NewsArticle }) {
  // Format date correctly if needed
  const formattedDate = new Date(article.date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Link href={`/tin-tuc/${article.slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={article.imageUrl} 
          alt={replaceDateShortcodes(article.title)} 
          className={styles.image} 
        />
      </div>
      <div className={styles.content}>
        <span className={styles.date}>{formattedDate}</span>
        <h3 className={styles.title}>{replaceDateShortcodes(article.title)}</h3>
        <p className={styles.excerpt}>{replaceDateShortcodes(article.excerpt)}</p>
        <div className={styles.readMore}>
          Đọc tiếp &rarr;
        </div>
      </div>
    </Link>
  );
}
