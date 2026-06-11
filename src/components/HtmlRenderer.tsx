'use client';

import { useEffect, useRef } from 'react';

export default function HtmlRenderer({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // React's dangerouslySetInnerHTML does not execute <script> tags.
    // This useEffect finds all script tags and recreates them to force execution.
    const scripts = containerRef.current.querySelectorAll('script');
    
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      
      // Copy all attributes (like src, type, etc)
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy internal content
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      
      // Replace the old script with the new one to trigger browser execution
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
