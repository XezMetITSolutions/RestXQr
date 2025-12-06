"use client";

import { useMemo } from 'react';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { FaBolt, FaBullhorn, FaInfoCircle, FaPercent, FaWifi, FaStar, FaClock, FaInstagram, FaCoffee, FaGift, FaHeart } from 'react-icons/fa';

export default function AnnouncementStatic() {
  const { announcements } = useAnnouncementStore();
  const staticAnns = useMemo(() => announcements.filter(a => !a.ticker), [announcements]);

  if (staticAnns.length === 0) return null;

  const renderIcon = (icon?: string) => {
    switch (icon) {
      case 'wifi':
        return <FaWifi className="text-orange-600" />;
      case 'google':
        return <FaStar className="text-yellow-600" />;
      case 'clock':
        return <FaClock className="text-green-600" />;
      case 'instagram':
        return <FaInstagram className="text-pink-600" />;
      case 'coffee':
        return <FaCoffee className="text-amber-600" />;
      case 'loyalty':
        return <FaHeart className="text-red-600" />;
      case 'birthday':
        return <FaGift className="text-purple-600" />;
      case 'flash':
        return <FaBolt className="text-orange-600" />;
      case 'sale':
        return <FaPercent className="text-orange-600" />;
      case 'info':
        return <FaInfoCircle className="text-orange-600" />;
      default:
        return <FaBullhorn className="text-orange-600" />;
    }
  };

  const getCardStyle = (icon?: string) => {
    switch (icon) {
      case 'wifi':
        return 'bg-orange-50 border-l-4 border-orange-500';
      case 'google':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'clock':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'instagram':
        return 'bg-pink-50 border-l-4 border-pink-500';
      case 'coffee':
        return 'bg-amber-50 border-l-4 border-amber-500';
      case 'loyalty':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'birthday':
        return 'bg-purple-50 border-l-4 border-purple-500';
      default:
        return 'bg-orange-50 border-l-4 border-orange-500';
    }
  };

  return (
    <div className="space-y-3">
      {staticAnns.map((a) => (
        <div key={a.id} className={`p-4 rounded-lg ${getCardStyle((a as any).icon)}`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {renderIcon((a as any).icon)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{a.title || 'Duyuru'}</h3>
              {a.description && (
                <p className="text-xs text-gray-600">{a.description}</p>
              )}
            </div>
            {(a as any).action && (
              <button className="px-3 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium hover:bg-opacity-70 transition-colors">
                {(a as any).action}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
