'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const languageList = [
  { code: 'Turkish', label: 'TR' },
  { code: 'English', label: 'EN' },
  { code: 'German', label: 'DE' },
  { code: 'French', label: 'FR' },
  { code: 'Spanish', label: 'ES' },
  { code: 'Italian', label: 'IT' },
  { code: 'Russian', label: 'RU' },
  { code: 'Arabic', label: 'AR' },
  { code: 'Chinese', label: 'ZH' },
];

const languageMap: { [key: string]: string } = {
  'tr': 'Turkish',
  'en': 'English',
  'de': 'German',
  'fr': 'French',
  'es': 'Spanish',
  'it': 'Italian',
  'ru': 'Russian',
  'ar': 'Arabic',
  'zh': 'Chinese'
};

interface LanguageSelectorProps {
  enabledLanguages?: string[];
}

export default function LanguageSelector({ enabledLanguages }: LanguageSelectorProps) {
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

  const filteredLanguages = enabledLanguages
    ? languageList.filter(l => {
      // Find the code that maps to this language name
      const shortCode = Object.keys(languageMap).find(key => languageMap[key] === l.code);
      return shortCode && enabledLanguages.includes(shortCode);
    })
    : languageList;

  if (filteredLanguages.length <= 1) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 px-3 py-1 text-sm font-bold rounded-xl bg-white shadow border border-gray-200 text-gray-800 hover:bg-gray-50 focus:outline-none min-w-[50px]"
        style={{ minWidth: 50 }}
      >
        <span>{languageList.find(l => l.code === currentLanguage)?.label || 'TR'}</span>
        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M6 8L10 12L14 8" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[120px] z-50 overflow-hidden flex flex-col py-2">
          {filteredLanguages.map(lang => (
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
