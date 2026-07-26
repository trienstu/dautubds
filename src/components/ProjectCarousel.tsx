'use client';

import { useRef } from 'react';
import Link from 'next/link';
import styles from '../app/(site)/page.module.css';
import { ChevronLeft, ChevronRight, MapPin, Building2, ArrowRight } from 'lucide-react';

export default function ProjectCarousel({ projects }: { projects: any[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 420; // 400px card + 20px gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className={styles.carouselNavBtn} 
        style={{ left: '-20px' }}
        onClick={() => scroll('left')}
        aria-label="Previous"
      >
        <ChevronLeft size={24} />
      </button>

      <div className={styles.carouselContainer} ref={carouselRef}>
        {projects.map((project: any) => (
          <Link href={`/du-an/${project.slug}`} key={project.id} className={styles.carouselCard}>
            <div className={styles.carouselImgWrapper}>
              <div className={styles.carouselBadge}>HOT</div>
              <img src={project.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} alt={project.title} loading="lazy" />
            </div>
            <div className={styles.carouselContent}>
              <h3 className={styles.carouselTitle}>{project.title}</h3>
              <p className={styles.carouselPrice}>{project.price ? project.price : 'Đang cập nhật'}</p>
              <p className={styles.carouselLocation}><MapPin size={14} className={styles.carouselIcon} /> {project.location}</p>
              
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
        ))}
      </div>

      <button 
        className={styles.carouselNavBtn} 
        style={{ right: '-20px' }}
        onClick={() => scroll('right')}
        aria-label="Next"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
