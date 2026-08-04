'use client';

import React, { useState } from 'react';
import styles from './ZaloMarketing.module.css';
import { CheckCircle2, X, Copy, Check } from 'lucide-react';

const plans = [
  { id: '1m', name: 'Gói 1 Tháng', price: '200.000', unit: 'đ', amount: 200000, duration: '1 tháng', popular: false },
  { id: '3m', name: 'Gói 3 Tháng', price: '450.000', unit: 'đ', amount: 450000, duration: '3 tháng', popular: false },
  { id: '6m', name: 'Gói 6 Tháng', price: '800.000', unit: 'đ', amount: 800000, duration: '6 tháng', popular: false },
  { id: '12m', name: 'Gói 1 Năm', price: '1.500.000', unit: 'đ', amount: 1500000, duration: '1 năm', popular: true },
  { id: 'lt', name: 'Gói Trọn Đời', price: '3.000.000', unit: 'đ', amount: 3000000, duration: 'Trọn đời', popular: false },
];

export default function ZaloPricing() {
  const [pricingMode, setPricingMode] = useState<'term' | 'lifetime'>('term');
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const displayedPlans = pricingMode === 'term' ? plans.filter(p => p.id !== 'lt') : plans.filter(p => p.id === 'lt');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <section className={styles.pricingSection}>
      <div className={styles.sectionHeader}>
        <h2>Bảng Giá Bản Quyền</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          Lựa chọn gói phù hợp với nhu cầu của bạn. Đầu tư một lần, sử dụng full tính năng không giới hạn tài khoản Zalo.
        </p>
      </div>

      <div className={styles.tabsContainer} style={{ margin: '2rem auto' }}>
        <button 
          className={`${styles.tabBtn} ${pricingMode === 'term' ? styles.activeTab : ''}`}
          onClick={() => setPricingMode('term')}
        >
          Có Thời Hạn
          <span className={styles.tabBadge}>Phổ biến</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${pricingMode === 'lifetime' ? styles.activeTab : ''}`}
          onClick={() => setPricingMode('lifetime')}
        >
          Trọn Đời
        </button>
      </div>

      <div className={styles.pricingGridList} style={pricingMode === 'lifetime' ? { justifyContent: 'center' } : {}}>
        {displayedPlans.map(plan => (
          <div key={plan.id} className={`${styles.pricingCardNew} ${plan.popular ? styles.popularCard : ''}`}>
            {plan.popular && <div className={styles.popularBanner}>⭐ Phổ biến nhất</div>}
            
            <h3 className={styles.planNameNew}>{plan.name}</h3>
            
            <div className={styles.planPriceNew}>
              <span className={styles.priceAmount}>{plan.price}</span>
              <span className={styles.priceUnit}>{plan.unit}</span>
            </div>

            <button 
              className={plan.popular ? styles.btnWindows : styles.btnSecondaryNew}
              onClick={() => setSelectedPlan(plan)}
              style={plan.popular ? { width: '100%', justifyContent: 'center', marginBottom: '1.5rem', borderRadius: '8px' } : { width: '100%', padding: '1rem', borderRadius: '8px', fontWeight: 600, marginBottom: '1.5rem', transition: 'all 0.3s' }}
            >
              Đặt mua ngay
            </button>
            
            <ul className={styles.planFeaturesNew}>
              <li><CheckCircle2 size={16} className={styles.checkIcon} /> <strong>Không giới hạn</strong> tài khoản</li>
              <li><CheckCircle2 size={16} className={styles.checkIcon} /> <strong>Gửi tin nhắn</strong> hàng loạt</li>
              <li><CheckCircle2 size={16} className={styles.checkIcon} /> Tự động kết bạn từ SĐT</li>
              <li><CheckCircle2 size={16} className={styles.checkIcon} /> Quản lý thẻ tag, khách hàng</li>
              <li><CheckCircle2 size={16} className={styles.checkIcon} /> Hỗ trợ kỹ thuật 24/7</li>
              <li><CheckCircle2 size={16} className={styles.checkIcon} /> Cập nhật phiên bản mới</li>
            </ul>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPlan(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedPlan(null)}>
              <X size={24} />
            </button>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>Thanh Toán Bản Quyền</h3>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              <strong>{selectedPlan.name}</strong> - Số tiền: <strong>{selectedPlan.price}{selectedPlan.unit}</strong>
            </p>
            
            <div className={styles.qrContainer}>
              <img 
                src={`https://img.vietqr.io/image/vcb-1013088802-compact2.jpg?amount=${selectedPlan.amount}&addInfo=zalo mkt ${selectedPlan.id}&accountName=TRINH%20QUOC%20CUONG`}
                alt="Mã QR Thanh Toán"
                className={styles.qrImage}
              />
            </div>
            
            <div className={styles.bankDetails}>
              <div style={{ marginBottom: '0.8rem' }}>Ngân hàng: <strong>Vietcombank</strong></div>
              
              <div className={styles.bankInfoRow}>
                <span>Số tài khoản: <strong>1013088802</strong></span>
                <button className={styles.copyBtn} onClick={() => handleCopy('1013088802')} title="Copy số tài khoản">
                  {copiedText === '1013088802' ? <Check size={18} color="var(--color-primary)" /> : <Copy size={18} />}
                </button>
              </div>
              
              <div style={{ marginBottom: '0.8rem' }}>Chủ tài khoản: <strong>TRINH QUOC CUONG</strong></div>
              
              <div className={styles.bankInfoRow}>
                <span>Nội dung CK: <strong>zalo mkt {selectedPlan.id}</strong></span>
                <button className={styles.copyBtn} onClick={() => handleCopy(`zalo mkt ${selectedPlan.id}`)} title="Copy nội dung">
                  {copiedText === `zalo mkt ${selectedPlan.id}` ? <Check size={18} color="var(--color-primary)" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Sau khi chuyển khoản, vui lòng liên hệ Zalo Admin để nhận key kích hoạt.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
