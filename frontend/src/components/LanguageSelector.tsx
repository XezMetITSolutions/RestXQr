'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const languageList = [
  { code: 'Turkish', label: 'TR' },
  { code: 'English', label: 'EN' },
  { code: 'German', label: 'DE' },
  { code: 'Arabic', label: 'AR' },
  { code: 'Russian', label: 'RU' },
];

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 px-3 py-1 text-sm font-bold rounded-xl bg-white shadow border border-gray-200 text-gray-800 hover:bg-gray-50 focus:outline-none min-w-[40px]"
        style={{ minWidth: 40 }}
      >
        <span>{languageList.find(l => l.code === currentLanguage)?.label || 'TR'}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M6 8L10 12L14 8" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[120px] z-50 overflow-hidden flex flex-col py-2">
          {languageList.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`px-4 py-2 text-sm font-bold text-left transition-colors rounded-none ${currentLanguage === lang.code ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-50 text-gray-800'}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
