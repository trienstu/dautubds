'use client';

import React, { useState } from 'react';

export default function MortgageCalculator() {
  const [price, setPrice] = useState<number>(3000000000); // 3 Tỷ
  const [loanRatio, setLoanRatio] = useState<number>(70); // 70%
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%
  const [termYears, setTermYears] = useState<number>(20); // 20 years
  const [method, setMethod] = useState<'diminishing' | 'fixed'>('diminishing'); // Dư nợ giảm dần hoặc Trả đều

  const loanAmount = price * (loanRatio / 100);
  const termMonths = termYears * 12;
  const monthlyInterestRate = interestRate / 100 / 12;

  let totalInterest = 0;
  let totalPayment = 0;

  if (method === 'fixed') {
    // Trả góp đều hàng tháng (Công thức Annunity)
    const fixedMonthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / (Math.pow(1 + monthlyInterestRate, termMonths) - 1);
    totalPayment = fixedMonthlyPayment * termMonths;
    totalInterest = totalPayment - loanAmount;
  } else {
    // Dư nợ giảm dần
    const monthlyPrincipal = loanAmount / termMonths;
    for (let i = 0; i < termMonths; i++) {
      const remainingPrincipal = loanAmount - (monthlyPrincipal * i);
      const monthlyInterest = remainingPrincipal * monthlyInterestRate;
      totalInterest += monthlyInterest;
    }
    totalPayment = loanAmount + totalInterest;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333', marginTop: '3rem' }}>
      <h3 style={{ marginBottom: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📊 Công cụ tính lãi vay nâng cao
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
            <span>Giá trị nhà đất (VNĐ)</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{formatCurrency(price)}</span>
          </label>
          <input 
            aria-label="Giá trị nhà đất"
            type="range" min="500000000" max="50000000000" step="100000000" 
            value={price} onChange={(e) => setPrice(Number(e.target.value))} 
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
            <span>Tỷ lệ vay (%)</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{loanRatio}%</span>
          </label>
          <input 
            aria-label="Tỷ lệ vay"
            type="range" min="0" max="100" step="5" 
            value={loanRatio} onChange={(e) => setLoanRatio(Number(e.target.value))} 
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
            <span>Lãi suất %/năm</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{interestRate}%</span>
          </label>
          <input 
            aria-label="Lãi suất"
            type="range" min="1" max="20" step="0.1" 
            value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} 
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
            <span>Thời hạn vay (năm)</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{termYears} năm</span>
          </label>
          <input 
            aria-label="Thời hạn vay"
            type="range" min="1" max="35" step="1" 
            value={termYears} onChange={(e) => setTermYears(Number(e.target.value))} 
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Phương thức thanh toán:</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setMethod('diminishing')}
            style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: `1px solid ${method === 'diminishing' ? 'var(--color-primary)' : '#444'}`, background: method === 'diminishing' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', color: method === 'diminishing' ? 'var(--color-primary)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s' }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Dư nợ giảm dần</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Gốc giảm dần theo thời gian, tiền lãi giảm theo từng tháng.</div>
          </button>
          <button 
            onClick={() => setMethod('fixed')}
            style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: `1px solid ${method === 'fixed' ? 'var(--color-primary)' : '#444'}`, background: method === 'fixed' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', color: method === 'fixed' ? 'var(--color-primary)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s' }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Trả góp đều hàng tháng</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Gốc và lãi chia đều, số tiền thanh toán cố định mỗi tháng.</div>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#222', padding: '1.5rem', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>VỐN CÓ SẴN</div>
          <div style={{ color: '#4CAF50', fontSize: '1.3rem', fontWeight: 'bold' }}>{formatCurrency(price - loanAmount)}</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid #333', borderRight: '1px solid #333' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>SỐ TIỀN VAY</div>
          <div style={{ color: '#2196F3', fontSize: '1.3rem', fontWeight: 'bold' }}>{formatCurrency(loanAmount)}</div>
        </div>
        <div style={{ textAlign: 'center', borderRight: '1px solid #333' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>TỔNG LÃI PHẢI TRẢ</div>
          <div style={{ color: '#FF9800', fontSize: '1.3rem', fontWeight: 'bold' }}>{formatCurrency(totalInterest)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>TỔNG CỘNG LÝ THUYẾT</div>
          <div style={{ color: '#9C27B0', fontSize: '1.3rem', fontWeight: 'bold' }}>{formatCurrency(totalPayment)}</div>
        </div>
      </div>
      
      <div style={{ background: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', marginTop: '1.5rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>TỔNG GIÁ TRỊ GIAO DỊCH</div>
        <div style={{ color: '#2196F3', fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(price + totalInterest)}</div>
      </div>
    </div>
  );
}
