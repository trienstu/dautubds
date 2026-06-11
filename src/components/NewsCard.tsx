import Link from 'next/link';
import styles from './NewsCard.module.css';
import { NewsArticle } from '@/data/mockData';

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
          alt={article.title} 
          className={styles.image} 
        />
      </div>
      <div className={styles.content}>
        <span className={styles.date}>{formattedDate}</span>
        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.excerpt}>{article.excerpt}</p>
        <div className={styles.readMore}>
          Đọc tiếp &rarr;
        </div>
      </div>
    </Link>
  );
}
