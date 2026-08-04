import React from 'react';
import { Download, Users, MessageCircle, UserPlus, UserCog, Monitor, Apple, PlayCircle, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import type { Metadata } from 'next';
import styles from './ZaloMarketing.module.css';
import ZaloPricing from './ZaloPricing';

export const metadata: Metadata = {
  title: 'Công Cụ Zalo Marketing - Giải Pháp CSKH Tự Động',
  description: 'Zalo Marketing: Đăng nhập đa tài khoản, gửi tin nhắn hàng loạt, kết bạn tự động và quản lý tệp khách hàng. Giải pháp số 1 cho Sales & Marketing.',
};

export default function ZaloMarketingPage() {
  const mainFeatures = [
    {
      icon: <Users size={32} />,
      title: 'Đăng Nhập Đa Tài Khoản',
      description: 'Quản lý không giới hạn số lượng tài khoản Zalo trên cùng một thiết bị. Chuyển đổi qua lại mượt mà, không lo bị thoát tài khoản hay mất dữ liệu chat.',
    },
    {
      icon: <MessageCircle size={32} />,
      title: 'Gửi Tin Nhắn Hàng Loạt',
      description: 'Tiếp cận hàng nghìn khách hàng tiềm năng chỉ bằng một click chuột. Hỗ trợ gửi kèm hình ảnh, tệp tin và cá nhân hoá nội dung tin nhắn (spin content).',
    },
    {
      icon: <UserPlus size={32} />,
      title: 'Tự Động Kết Bạn',
      description: 'Tự động gửi lời mời kết bạn theo tệp số điện thoại có sẵn. Thuật toán giãn cách thông minh giúp tỷ lệ chấp nhận cao và an toàn tuyệt đối cho tài khoản.',
    },
    {
      icon: <UserCog size={32} />,
      title: 'Quản Lý Khách Hàng',
      description: 'Tự động đổi tên gợi nhớ theo định dạng kèm số điện thoại giúp dễ dàng tra cứu, phân loại luồng khách hàng VIP, khách tiềm năng.',
    },
    {
      icon: <ShieldCheck size={32} />,
      title: 'An Toàn Chống Khóa',
      description: 'Cơ chế mô phỏng hành vi người dùng thật (human-like) chống lại các thuật toán quét spam của Zalo, bảo vệ tài nguyên của doanh nghiệp.',
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Báo Cáo Chi Tiết',
      description: 'Thống kê chính xác số lượng tin nhắn đã gửi thành công, số lượng kết bạn được chấp nhận, giúp đo lường hiệu quả chiến dịch dễ dàng.',
    },
  ];

  return (
    <main className={styles.container}>
      {/* Sticky Sub Menu */}
      <nav className={styles.subMenu}>
        <div className={styles.subMenuInner}>
          <a href="#download" className={styles.subMenuItem}>Tải Tool</a>
          <a href="#features" className={styles.subMenuItem}>Tính Năng</a>
          <a href="#pricing" className={styles.subMenuItem}>Bảng Giá</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero} id="download">
        <div className={styles.heroTag}>
          <Zap size={16} /> Phiên Bản Mới Nhất V2.0
        </div>
        <h1 className={styles.heroTitle}>
          Phần Mềm <span>Zalo Marketing</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Giải pháp toàn diện giúp tự động hoá quy trình chăm sóc khách hàng, mở rộng phễu tiềm năng và bứt phá doanh số trên nền tảng Zalo một cách an toàn nhất.
        </p>

        <div className={styles.downloadSection}>
          <a
            href="https://drive.google.com/file/d/1jZIumeU1Iaq9yV3FMqW1TDO4xmzHFD3w/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnWindows}
          >
            <Monitor size={24} />
            <div className={styles.btnMacText}>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>Tải Miễn Phí</div>
              <div>Cho Windows</div>
            </div>
            <Download size={20} style={{ marginLeft: '0.5rem' }} />
          </a>

          <div className={styles.btnMac}>
            <Apple size={24} />
            <div className={styles.btnMacText}>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Mac (Intel)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Coming soon</div>
            </div>
          </div>

          <div className={styles.btnMac}>
            <Apple size={24} />
            <div className={styles.btnMacText}>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Mac (M1/M2)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Coming soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section className={styles.videoSection}>
        <div className={styles.sectionHeader} style={{ marginBottom: '2rem' }}>
          <h2>Hướng Dẫn Cài Đặt & Sử Dụng</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Xem video dưới đây để làm chủ công cụ chỉ trong 5 phút</p>
        </div>
        <div className={styles.videoWrapper}>
          {/* USER: Replace the iframe src below with your actual YouTube embed link when ready */}
          <div className={styles.videoPlaceholder}>
            <div className={styles.playIcon}>
              <PlayCircle size={40} />
            </div>
            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Video Youtube sẽ được cập nhật tại đây</p>
            <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>(Vị trí đặt iFrame Video)</p>
          </div>
          {/* Example iFrame (uncomment and replace src):
          <iframe 
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
            title="Hướng dẫn Zalo Marketing" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
          */}
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className={styles.featuresWrapper} id="features">
        <div className={styles.sectionHeader}>
          <h2>Tại Sao Nên Chọn Zalo Marketing?</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            Hàng ngàn môi giới bất động sản và doanh nghiệp đã tăng 300% năng suất làm việc mỗi ngày nhờ bộ công cụ tự động hóa thông minh của chúng tôi.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {mainFeatures.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing">
        <ZaloPricing />
      </div>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Sẵn Sàng Để Tối Ưu Thời Gian?</h2>
        <p>Tải ngay phần mềm và gia nhập cộng đồng hơn 10.000 chuyên viên Sales đang sử dụng hệ thống Zalo Marketing mỗi ngày.</p>
        <a
          href="https://drive.google.com/file/d/1jZIumeU1Iaq9yV3FMqW1TDO4xmzHFD3w/view?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btnWindows}
          style={{ display: 'inline-flex' }}
        >
          Tải Xuống Ngay
          <Download size={20} />
        </a>
      </section>
    </main>
  );
}
