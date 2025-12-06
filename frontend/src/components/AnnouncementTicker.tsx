import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { FaBullhorn } from 'react-icons/fa';

interface AnnouncementTickerProps {
  className?: string;
  speed?: number; // px per second
  height?: number;
}

export default function AnnouncementTicker({ className = '', speed = 80, height = 44 }: AnnouncementTickerProps) {
  const { announcements } = useAnnouncementStore();
  const tickerAnns = useMemo(() => announcements.filter(a => a.ticker), [announcements]);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tickerAnns.length === 0) return;
    let raf: number;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000; // seconds
      last = now;
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const contentWidth = contentRef.current?.scrollWidth || 0;
      if (contentWidth === 0) {
        raf = requestAnimationFrame(loop);
        return;
      }
      setOffset(prev => {
        let next = prev - speed * dt;
        // reset when content fully left
        if (-next > contentWidth) next = containerWidth;
        return next;
      });
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tickerAnns, speed]);

  if (tickerAnns.length === 0) return null;

  const messages = tickerAnns.map(a => `${a.title}: ${a.description}`);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden bg-gradient-to-r from-orange-200 to-pink-200 border border-orange-300/40 rounded-xl shadow-sm ${className}`} style={{ height }}>
      <div className="h-full flex items-center px-3 gap-3">
        <FaBullhorn className="text-orange-600" />
        <div className="relative flex-1 h-full">
          <div ref={contentRef} className="absolute whitespace-nowrap will-change-transform" style={{ transform: `translateX(${offset}px)`, top: '50%', transformOrigin: 'left center', translate: `0 -50%` }}>
            {messages.join('  •  ')}
          </div>
        </div>
      </div>
    </div>
  );
}
