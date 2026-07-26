import Link from 'next/link';
import styles from './ProjectCard.module.css';
import { MapPin, Building2, ArrowRight } from 'lucide-react';

export default function ProjectCard({ project }: { project: any }) {
  return (
    <Link href={`/du-an/${project.slug}`} className={styles.carouselCard}>
      <div className={styles.carouselImgWrapper}>
        <div className={styles.carouselBadge}>{project.status || 'HOT'}</div>
        <img 
          src={project.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
          alt={project.title} 
          loading="lazy" 
        />
      </div>
      <div className={styles.carouselContent}>
        <h3 className={styles.carouselTitle}>{project.title}</h3>
        <p className={styles.carouselPrice}>{project.price ? project.price : 'Đang cập nhật'}</p>
        <p className={styles.carouselLocation}>
          <MapPin size={14} className={styles.carouselIcon} /> {project.location}
        </p>
        
        <div className={styles.carouselFooter}>
          <div className={styles.carouselDev}>
            <Building2 size={14} className={styles.carouselIcon} /> {project.developer || 'Đang cập nhật'}
          </div>
          <div className={styles.carouselArrow}>
            <ArrowRight size={18} color="var(--color-primary)" />
          </div>
        </div>
      </div>
    </Link>
  );
}
