'use client';

import React, { useEffect, useState } from 'react';

export default function ArticleTranslator() {
  const [currentLang, setCurrentLang] = useState('vi');

  useEffect(() => {
    // Check if currently translated
    const match = document.cookie.match(/googtrans=\/vi\/(.*?)(;|$)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }

    // Add Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: 'vi', autoDisplay: false },
          'google_translate_element'
        );
      };
    }

    return () => {
      // Khi rời khỏi bài viết, xóa cookie để không tự dịch các trang khác
      const domain = window.location.hostname;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };
  }, []);

  const translateTo = (lang: string) => {
    setCurrentLang(lang);
    document.cookie = `googtrans=/vi/${lang}; path=/;`;
    
    // Tìm thẻ select ẩn của Google Translate và kích hoạt
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    } else {
      // Fallback nếu widget chưa kịp render
      window.location.reload();
    }
  };

  const resetTranslation = () => {
    setCurrentLang('vi');
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = 'vi';
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="notranslate" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--color-secondary)', padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', width: 'fit-content', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <span style={{ color: 'var(--color-primary)', display: 'flex' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      </span>
      <button 
        onClick={resetTranslation}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: currentLang === 'vi' ? 700 : 500, color: currentLang === 'vi' ? 'var(--color-primary)' : 'var(--color-text-muted)', padding: 0 }}
      >
        <img src="https://flagcdn.com/w20/vn.png" alt="VN" style={{ width: '16px', borderRadius: '2px' }} /> Tiếng Việt
      </button>
      <span style={{ color: 'var(--border-color)' }}>|</span>
      <button 
        onClick={() => translateTo('en')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: currentLang === 'en' ? 700 : 500, color: currentLang === 'en' ? 'var(--color-primary)' : 'var(--color-text-muted)', padding: 0 }}
      >
        <img src="https://flagcdn.com/w20/gb.png" alt="EN" style={{ width: '16px', borderRadius: '2px' }} /> English
      </button>

      {/* Ẩn thanh banner của Google Translate */}
      <style dangerouslySetInnerHTML={{__html: `
        .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
      `}} />
    </div>
  );
}
