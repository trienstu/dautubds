'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { client } from '../../../../sanity/lib/client';

type SiteConfig = {
  phone?: string;
  email?: string;
  address?: string;
  facebookUrl?: string;
  zaloUrl?: string;
  youtubeUrl?: string;
};

export default function ContactClient() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Fetch site config purely for the client-side presentation
    const fetchConfig = async () => {
      const data = await client.fetch(`*[_type == "siteConfig"][0]`);
      setConfig(data);
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const formData = new FormData(e.currentTarget);
    
    // Web3Forms logic
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE");
    formData.append("subject", "Liên hệ mới từ Website");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <>
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Liên Hệ Với Chúng Tôi</h1>
          <p className={styles.heroSubtitle}>Khám phá bộ sưu tập bất động sản hạng sang. Hãy để chúng tôi đồng hành cùng bạn trên hành trình kiến tạo chuẩn mực sống đẳng cấp.</p>
        </div>
      </div>

      <div className={styles.contactContainer}>
        {/* Left Column: Info */}
        <div className={styles.infoColumn}>
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div className={styles.infoContent}>
              <h3>Điện Thoại (Hotline)</h3>
              {config?.phone ? (
                <a href={`tel:${config.phone.replace(/[^0-9+]/g, '')}`}>{config.phone}</a>
              ) : (
                <p>Đang tải...</p>
              )}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div className={styles.infoContent}>
              <h3>Email</h3>
              {config?.email ? (
                <a href={`mailto:${config.email}`}>{config.email}</a>
              ) : (
                <p>Đang tải...</p>
              )}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div className={styles.infoContent}>
              <h3>Trụ Sở Chính</h3>
              {config?.address ? (
                <p>{config.address}</p>
              ) : (
                <p>Đang tải...</p>
              )}
            </div>
          </div>
          
          {/* Social Links if available */}
          <div className={styles.infoCard}>
             <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
             </div>
             <div className={styles.infoContent}>
               <h3>Mạng Xã Hội</h3>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                 {config?.facebookUrl && <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer">Facebook</a>}
                 {config?.zaloUrl && <a href={config.zaloUrl} target="_blank" rel="noopener noreferrer">Zalo</a>}
                 {config?.youtubeUrl && <a href={config.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube</a>}
                 {!config?.facebookUrl && !config?.zaloUrl && !config?.youtubeUrl && <p>Đang tải...</p>}
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className={styles.formColumn}>
          <h2 className={styles.formTitle}>Gửi Lời Nhắn</h2>
          <p className={styles.formSubtitle}>Vui lòng để lại thông tin, chuyên viên của chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Họ và tên *</label>
              <input type="text" id="name" name="name" required placeholder="Ví dụ: Nguyễn Văn A" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Số điện thoại *</label>
              <input type="tel" id="phone" name="phone" required placeholder="Ví dụ: 0901234567" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Ví dụ: email@domain.com" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Lời nhắn *</label>
              <textarea id="message" name="message" rows={4} required placeholder="Bạn đang quan tâm đến dự án nào?"></textarea>
            </div>
            <button type="submit" disabled={status === 'submitting'} className={styles.submitBtn}>
              {status === 'submitting' ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
            </button>
          </form>

          {status === 'success' && (
            <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>
              ✅ Cảm ơn bạn. Yêu cầu của bạn đã được gửi thành công!
            </div>
          )}
          {status === 'error' && (
            <div className={`${styles.statusMessage} ${styles.statusError}`}>
              ❌ Có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ Hotline.
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className={styles.mapSection}>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.324209935105!2d106.70014731533418!3d10.772412892323712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f413a96860d%3A0x6b7724e54afc2a71!2sBitexco%20Financial%20Tower!5e0!3m2!1sen!2s!4v1655182181559!5m2!1sen!2s" 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </>
  );
}
