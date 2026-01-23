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

  // enabledLanguages'i küçük harfe çevir ve debug et
  const normalizedEnabledLanguages = enabledLanguages?.map(lang => lang.toLowerCase()) || [];
  console.log('LanguageSelector - original enabledLanguages:', enabledLanguages);
  console.log('LanguageSelector - normalized enabledLanguages:', normalizedEnabledLanguages);

  const filteredLanguages = (normalizedEnabledLanguages && normalizedEnabledLanguages.length > 0)
    ? languageList.filter(l => {
      const shortCode = Object.keys(languageMap).find(key => languageMap[key] === l.code);
      const isIncluded = shortCode && normalizedEnabledLanguages.includes(shortCode);
      console.log(`Language ${l.code} (${shortCode}): ${isIncluded}`);
      return isIncluded;
    })
    : languageList; // If no languages enabled, show all available ones

  console.log('filteredLanguages:', filteredLanguages);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {filteredLanguages.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${currentLanguage === lang.code
            ? 'bg-orange-600 text-white border-orange-600'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
        >
          {lang.label}
        </button>
      ))}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
