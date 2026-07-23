'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, Mic, MapPin, DollarSign, Building, Activity, ChevronDown } from 'lucide-react';

export default function ProjectSearch({ provinces = [] }: { provinces?: { title: string, slug: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    
    startTransition(() => {
      router.push(`/du-an?${params.toString()}`);
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`/du-an?${params.toString()}`);
    });
  };

  return (
    <div className="project-search-container">
      <form onSubmit={handleSearch} className="search-input-wrapper">
        <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
        <input 
          type="text" 
          placeholder="Tìm kiếm dự án..." 
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" style={{ display: 'none' }}></button>
        <Mic size={18} style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }} />
      </form>
      
      <div className="search-filters">
        {/* Khu vực */}
        <div className="filter-dropdown-wrapper">
          <select 
            value={searchParams.get('province') || ''}
            onChange={(e) => handleFilterChange('province', e.target.value)}
            className="filter-select"
          >
            <option value="">Khu vực</option>
            {provinces.map(p => (
              <option key={p.slug} value={p.slug}>{p.title}</option>
            ))}
          </select>
          <MapPin size={16} className="filter-icon-left" />
          <ChevronDown size={14} className="filter-icon-right" />
        </div>

        {/* Loại hình */}
        <div className="filter-dropdown-wrapper">
          <select 
            value={searchParams.get('category') || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Loại hình</option>
            <option value="biet-thu">Biệt thự</option>
            <option value="nha-pho">Nhà phố</option>
            <option value="can-ho">Căn hộ</option>
            <option value="dat-nen">Đất nền</option>
          </select>
          <Building size={16} className="filter-icon-left" />
          <ChevronDown size={14} className="filter-icon-right" />
        </div>

        {/* Trạng thái */}
        <div className="filter-dropdown-wrapper">
          <select 
            value={searchParams.get('status') || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">Trạng thái</option>
            <option value="Đang mở bán">Đang mở bán</option>
            <option value="Sắp ra mắt">Sắp ra mắt</option>
            <option value="Đã bàn giao">Đã bàn giao</option>
          </select>
          <Activity size={16} className="filter-icon-left" />
          <ChevronDown size={14} className="filter-icon-right" />
        </div>
      </div>
    </div>
  );
}
