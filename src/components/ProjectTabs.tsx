'use client';

import React, { useEffect, useState } from 'react';

export default function ProjectTabs({ project }: { project: any }) {
  const [activeTab, setActiveTab] = useState('tong-quan');

  // Logic kiểm tra xem phần nào có dữ liệu
  const tabs = [
    { id: 'tong-quan', label: 'Tổng quan', hasData: !!project.description },
    { id: 'vi-tri', label: 'Vị trí', hasData: !!project.mapHtml || !!project.locationContent },
    { id: 'bang-gia', label: 'Bảng giá', hasData: !!project.pricingContent },
    { id: 'phap-ly', label: 'Pháp lý', hasData: (project.legalDocuments && project.legalDocuments.length > 0) || !!project.legalContent },
    { id: 'tien-ich', label: 'Tiện ích', hasData: (project.features && project.features.length > 0) || !!project.featuresContent },
    { id: 'mat-bang', label: 'Mặt bằng', hasData: (project.floorPlans && project.floorPlans.length > 0) || !!project.floorPlanContent },
    { id: 'thiet-ke', label: 'Thiết kế', hasData: !!project.designContent },
    { id: 'nha-mau', label: 'Nhà mẫu', hasData: !!project.showroomContent },
    { id: 'tour-360', label: 'Tour 360°', hasData: !!project.tour360Url },
    { id: 'tien-do', label: 'Tiến độ', hasData: !!project.progressContent },
    { id: 'hoi-dap', label: 'Hỏi đáp', hasData: !!project.faqs && project.faqs.length > 0 },
    { id: 'chu-dau-tu', label: 'Chủ đầu tư', hasData: !!project.developer },
  ].filter(tab => tab.hasData); // Chỉ giữ lại các tab có dữ liệu

  // Theo dõi cuộn trang để active tab tự động
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // offset cho thanh menu sticky

      for (let i = tabs.length - 1; i >= 0; i--) {
        const section = document.getElementById(tabs[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(tabs[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tabs]);

  // Tự động cuộn thanh menu ngang (tabs) đến tab đang active
  useEffect(() => {
    const activeElement = document.getElementById(`tab-${activeTab}`);
    const container = document.getElementById('project-tabs-container');
    
    if (activeElement && container) {
      const containerWidth = container.offsetWidth;
      const elementOffset = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;
      
      // Tính toán vị trí cuộn để đưa tab ra giữa màn hình
      const scrollPos = elementOffset - (containerWidth / 2) + (elementWidth / 2);
      
      container.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      });
    }
  }, [activeTab]);

  if (tabs.length === 0) return null;

  return (
    <div style={{
      position: 'sticky',
      top: '0', // Stick right at the top
      background: 'var(--background)',
      zIndex: 50,
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      width: '100%'
    }}>
      <div id="project-tabs-container" className="container-wide" style={{
        display: 'flex',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        width: '100%',
        position: 'relative'
      }}>
        <style>{`
          .project-tabs::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="project-tabs" style={{ display: 'flex', gap: '2rem', padding: '0 1rem' }}>
          {tabs.map(tab => (
            <a
              id={`tab-${tab.id}`}
              key={tab.id}
              href={`#${tab.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(tab.id);
                if (element) {
                   const y = element.getBoundingClientRect().top + window.pageYOffset - 120; // Offset trừ đi height của Sticky Tabs + Header
                   window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              style={{
                display: 'block',
                padding: '1rem 0',
                fontSize: '1rem',
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
