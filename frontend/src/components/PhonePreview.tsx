'use client';

import React from 'react';
import { BusinessSettings } from '@/types';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';

interface PhonePreviewProps {
  settings?: BusinessSettings;
  className?: string;
}

const PhonePreview: React.FC<PhonePreviewProps> = ({ settings: propSettings, className = '' }) => {
  // Store'dan settings'i al, propSettings varsa onu kullan
  const storeSettings = useBusinessSettingsStore(state => state.settings);
  const settings = propSettings || storeSettings;
  
  const { basicInfo = {}, branding = {} } = settings;

  // Renk hesaplamaları
  const getBackgroundColor = () => {
    if (branding?.backgroundColor) return branding.backgroundColor;
    return '#FFFFFF';
  };

  const getAccentColor = () => {
    if (branding?.accentColor) return branding.accentColor;
    return '#F3F4F6';
  };

  const getTextColor = () => {
    // Ana rengin koyu versiyonu
    const primaryColor = branding?.primaryColor || '#F97316';
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#1F2937' : '#FFFFFF';
  };

  const getSecondaryTextColor = () => {
    const secondaryColor = branding?.secondaryColor || '#FB923C';
    const hex = secondaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#374151' : '#E5E7EB';
  };

  const getFontSize = () => {
    switch (branding?.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getHeaderStyle = () => {
    const primaryColor = branding?.primaryColor || '#F97316';
    const secondaryColor = branding?.secondaryColor || '#FB923C';
    const accentColor = getAccentColor();
    
    switch (branding?.headerStyle) {
      case 'gradient':
        return {
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
          border: 'none'
        };
      case 'solid':
        return {
          backgroundColor: primaryColor,
          border: 'none'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${primaryColor}`
        };
      case 'minimal':
        return {
          backgroundColor: accentColor,
          borderBottom: `2px solid ${primaryColor}`,
          border: 'none'
        };
      default:
        return {
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
          border: 'none'
        };
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Telefon Çerçevesi */}
      <div className="relative w-80 h-[600px] mx-auto bg-gray-800 rounded-[3rem] p-2 shadow-2xl">
        <div className="w-full h-full bg-gray-900 rounded-[2.5rem] p-1">
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
            {/* Status Bar */}
            <div className="h-6 bg-gray-100 flex items-center justify-between px-4 text-xs text-gray-600">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                <div className="w-6 h-3 border border-gray-400 rounded-sm"></div>
              </div>
            </div>

             {/* Header - Menü Başlığı */}
             <div className="px-4 py-3 flex items-center justify-between" style={{ ...getHeaderStyle() }}>
               <div className="flex items-center gap-2">
                 <button className="p-1">
                   <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                 </button>
                 <h1 
                   className="text-lg font-bold"
                   style={{ 
                     color: getTextColor(),
                     fontFamily: branding?.fontFamily || 'Poppins'
                   }}
                 >
                   Menü
                 </h1>
                 <span 
                   className="px-2 py-1 bg-gray-200 text-xs rounded-full"
                   style={{ 
                     color: getSecondaryTextColor(),
                     fontFamily: branding?.fontFamily || 'Poppins'
                   }}
                 >
                   Masa #5
                 </span>
               </div>
               <button 
                 className="px-3 py-1 bg-white text-xs rounded-full border flex items-center gap-1"
                 style={{ 
                   color: getTextColor(),
                   fontFamily: branding?.fontFamily || 'Poppins'
                 }}
               >
                 TR
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </button>
             </div>

             {/* Arama Çubuğu */}
             <div className="px-4 py-3 bg-white border-b">
               <div className="relative">
                 <input
                   type="text"
                   placeholder="Menüde ara..."
                   className="w-full px-4 py-2 bg-gray-50 rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500"
                   style={{ 
                     fontFamily: branding?.fontFamily || 'Poppins',
                     color: getTextColor()
                   }}
                 />
                 <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </div>
             </div>

             {/* Özel Teklif Banner */}
             <div 
               className="mx-4 my-3 p-3 rounded-lg text-white"
               style={{ 
                 background: `linear-gradient(135deg, ${branding?.primaryColor || '#F97316'}, ${branding?.secondaryColor || '#FB923C'})`,
                 fontFamily: branding?.fontFamily || 'Poppins'
               }}
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                   </svg>
                 </div>
                 <div>
                   <div className="font-bold text-sm">Bugüne Özel!</div>
                   <div className="text-xs opacity-90">Tüm tatlılarda %20 indirim - Sadece bugün geçerli</div>
                 </div>
               </div>
             </div>

            {/* Kategori Tabları */}
            <div className="px-4 py-2 bg-white border-b">
              <div className="flex gap-2 overflow-x-auto">
                {['Popüler', 'Başlangıçlar', 'Ana Yemekler', 'Tatlılar', 'İçecekler'].map((category, index) => (
                  <button
                    key={category}
                    className={`px-3 py-2 text-sm rounded-full whitespace-nowrap ${
                      index === 0 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{ 
                      fontFamily: branding?.fontFamily || 'Poppins',
                      backgroundColor: index === 0 ? branding?.primaryColor || '#F97316' : undefined
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menü İçeriği */}
            <div 
              className="flex-1 px-4 py-4 overflow-y-auto"
              style={{ backgroundColor: getBackgroundColor() }}
            >
              {/* Örnek Menü Öğesi - Bruschetta */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                <div className="flex gap-3">
                  {/* Menü Öğesi Resmi */}
                  <div className="relative w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">★</span>
                    </div>
                  </div>
                  
                  {/* Menü Öğesi Bilgileri */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 
                        className={`font-semibold ${getFontSize()}`}
                        style={{ 
                          color: getTextColor(),
                          fontFamily: branding?.fontFamily || 'Poppins'
                        }}
                      >
                        Bruschetta
                      </h3>
                      <div 
                        className="text-sm font-bold"
                        style={{ color: branding?.primaryColor || '#F97316' }}
                      >
                        45 ₺
                      </div>
                    </div>
                    
                    <p 
                      className="text-xs text-gray-600 mb-2"
                      style={{ 
                        fontFamily: branding?.fontFamily || 'Poppins'
                      }}
                    >
                      Sarımsaklı, zeytinyağlı ve domatesli kızarmış ekmek.
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span 
                        className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full"
                        style={{ fontFamily: branding?.fontFamily || 'Poppins' }}
                      >
                        Gluten
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
                        style={{ 
                          fontFamily: branding?.fontFamily || 'Poppins',
                          color: getTextColor()
                        }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Detayları Gör
                      </button>
                      <button 
                        className="px-4 py-2 text-xs rounded-lg text-white flex items-center gap-1"
                        style={{ 
                          backgroundColor: branding.primaryColor,
                          fontFamily: branding?.fontFamily || 'Poppins'
                        }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diğer Menü Öğeleri */}
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 
                        className={`font-semibold mb-1 ${getFontSize()}`}
                        style={{ 
                          color: getTextColor(),
                          fontFamily: branding?.fontFamily || 'Poppins'
                        }}
                      >
                        Izgara Tavuk
                      </h3>
                      <p 
                        className="text-xs mb-2 text-gray-600"
                        style={{ 
                          fontFamily: branding?.fontFamily || 'Poppins'
                        }}
                      >
                        Marine edilmiş tavuk göğsü ızgarada pişirilerek servis edilir.
                      </p>
                      <div 
                        className="text-sm font-bold"
                        style={{ color: branding?.primaryColor || '#F97316' }}
                      >
                        ₺85.00
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 
                        className={`font-semibold mb-1 ${getFontSize()}`}
                        style={{ 
                          color: getTextColor(),
                          fontFamily: branding?.fontFamily || 'Poppins'
                        }}
                      >
                        Köfte Tabağı
                      </h3>
                      <p 
                        className="text-xs mb-2 text-gray-600"
                        style={{ 
                          fontFamily: branding?.fontFamily || 'Poppins'
                        }}
                      >
                        Ev yapımı köfte, pilav ve salata ile servis edilir.
                      </p>
                      <div 
                        className="text-sm font-bold"
                        style={{ color: branding?.primaryColor || '#F97316' }}
                      >
                        ₺75.00
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Navigasyon */}
            <div className="bg-white border-t px-4 py-2">
              <div className="flex justify-around">
                <button 
                  className="flex flex-col items-center gap-1 py-2"
                  style={{ color: branding.primaryColor }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 2h18a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zm1 2v16h16V4H4z"/>
                  </svg>
                  <span className="text-xs font-medium" style={{ fontFamily: branding?.fontFamily || 'Poppins' }}>Menü</span>
                </button>
                <button className="flex flex-col items-center gap-1 py-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                  </svg>
                  <span className="text-xs" style={{ fontFamily: branding?.fontFamily || 'Poppins' }}>Sepet</span>
                </button>
                <button className="flex flex-col items-center gap-1 py-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z"/>
                  </svg>
                  <span className="text-xs" style={{ fontFamily: branding?.fontFamily || 'Poppins' }}>Garson Çağır</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePreview;
