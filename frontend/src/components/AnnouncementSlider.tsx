"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { FaBullhorn, FaBolt } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

interface AnnouncementSliderProps {
  className?: string;
}

export default function AnnouncementSlider({ className = '' }: AnnouncementSliderProps) {
  const { announcements } = useAnnouncementStore();
  const { currentLanguage } = useLanguage();
  const slides = useMemo(() => announcements.filter(a => a.ticker), [announcements]);
  const [idx, setIdx] = useState(0);
  const [sliding, setSliding] = useState(false);
  const timerRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length === 0) return;
    const current = slides[idx];
    // Daha kısa ve tutarlı bir gösterim süresi (3-6 sn arası, varsayılan 5sn)
    const seconds = Math.max(2, Math.min(4, current?.durationSec || 3));
    const duration = seconds * 1000;
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      // Başlat: slide-up animasyonu
      setSliding(true);
      // Animasyon süresi ~450ms sonra index güncelle
      animRef.current = window.setTimeout(() => {
        setIdx(prev => (prev + 1) % slides.length);
        setSliding(false);
      }, 450);
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [idx, slides]);

  if (slides.length === 0) return null;
  const current = slides[idx];
  const next = slides[(idx + 1) % slides.length];

  return (
    <div className={`rounded-lg p-4 flex items-center shadow-lg bg-gradient-to-r from-orange-400 to-pink-500 text-white ${className}`}>
      <div className="mr-3 text-2xl">
        {/* İkon seçimi: duyuru.icon === 'flash' ise şimşek */}
        { (current as any)?.icon === 'flash' ? <FaBolt /> : <FaBullhorn /> }
      </div>
      <div className="overflow-hidden w-full">
        <div className="relative h-14">
          {/* Mevcut */}
          <div
            key={`cur-${current.id}`}
            className={`absolute inset-0 flex flex-col justify-center transition-transform duration-500 ease-out ${
              sliding ? '-translate-y-full' : 'translate-y-0'
            }`}
          >
            <div className="font-semibold text-lg"><TranslatedText>{current.title || 'Duyuru'}</TranslatedText></div>
            <div className="text-sm opacity-95"><TranslatedText>{current.description}</TranslatedText></div>
          </div>
          {/* Sonraki */}
          <div
            key={`next-${next.id}`}
            className={`absolute inset-0 flex flex-col justify-center transition-transform duration-500 ease-out ${
              sliding ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="font-semibold text-lg"><TranslatedText>{next.title || 'Duyuru'}</TranslatedText></div>
            <div className="text-sm opacity-95"><TranslatedText>{next.description}</TranslatedText></div>
          </div>
        </div>
      </div>
    </div>
  );
}
