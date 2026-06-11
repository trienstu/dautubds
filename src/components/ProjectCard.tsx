import Image from 'next/image';
import styles from './ProjectCard.module.css';
import { Project } from '@/data/mockData';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <a href={`/du-an/${project.slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <div className={styles.badge}>{project.status}</div>
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className={styles.image} 
        />
      </div>
      <div className={styles.content}>
        <span className={styles.category}>{project.category}</span>
        <h3 className={styles.title}>{project.title}</h3>
        <div className={styles.location}>
          📍 {project.location}
        </div>
        <div className={styles.price}>{project.price}</div>
      </div>
    </a>
  );
}
