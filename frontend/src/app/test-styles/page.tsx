"use client";

import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';

export default function TestStylesPage() {
  const { settings, updateBranding } = useBusinessSettingsStore();

  // Debug için console.log
  console.log('Current settings:', settings.branding);

  const testColors = [
    { name: 'Mor', value: '#8B5CF6' },
    { name: 'Mavi', value: '#3B82F6' },
    { name: 'Yeşil', value: '#10B981' },
    { name: 'Turuncu', value: '#F59E0B' },
    { name: 'Kırmızı', value: '#EF4444' },
    { name: 'Pembe', value: '#EC4899' },
  ];

  const testFonts = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
  ];

  const testSizes = [
    { name: 'Küçük', value: 'small' },
    { name: 'Orta', value: 'medium' },
    { name: 'Büyük', value: 'large' },
  ];

  return (
    <div 
      className="min-h-screen bg-gray-50 p-8"
      style={{ 
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size-base)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Stil Ayarları Test Sayfası
        </h1>

        {/* Mevcut Ayarlar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Mevcut Ayarlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Ana Renk:</p>
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: settings.branding.primaryColor }}
              ></div>
              <p className="text-sm">{settings.branding.primaryColor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Font Ailesi:</p>
              <p className="text-sm font-medium">{settings.branding.fontFamily}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Font Boyutu:</p>
              <p className="text-sm font-medium">{settings.branding.fontSize}</p>
            </div>
          </div>
        </div>

        {/* Renk Testleri */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Renk Değiştir</h2>
          <div className="flex flex-wrap gap-3">
            {testColors.map((color) => (
              <button
                key={color.value}
                onClick={() => updateBranding({ primaryColor: color.value })}
                className={`w-12 h-12 rounded-lg border-2 transition-colors ${
                  settings.branding.primaryColor === color.value 
                    ? 'border-purple-500 ring-2 ring-purple-200' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Font Testleri */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Font Ailesi Değiştir</h2>
          <div className="flex flex-wrap gap-3">
            {testFonts.map((font) => (
              <button
                key={font.value}
                onClick={() => updateBranding({ fontFamily: font.value })}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  settings.branding.fontFamily === font.value 
                    ? 'border-brand-primary bg-brand-primary text-white' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>

        {/* Font Boyutu Testleri */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Font Boyutu Değiştir</h2>
          <div className="flex flex-wrap gap-3">
            {testSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => updateBranding({ fontSize: size.value as 'small' | 'medium' | 'large' })}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  settings.branding.fontSize === size.value 
                    ? 'border-brand-primary bg-brand-primary text-white' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>

        {/* Test Bileşenleri */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Bileşenleri</h2>
          
          {/* Butonlar */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Butonlar</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary">
                Primary Button
              </button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-outline">
                Outline Button
              </button>
            </div>
          </div>

          {/* Kartlar */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Kartlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <h4 className="font-semibold text-brand mb-2">
                  Test Kartı 1
                </h4>
                <p className="text-gray-600">Bu kart brand color ile test ediliyor.</p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-brand mb-2">
                  Test Kartı 2
                </h4>
                <p className="text-gray-600">Font boyutu ve ailesi burada görünüyor.</p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Input Alanı</h3>
            <input 
              type="text" 
              placeholder="Test input alanı..." 
              className="input w-full max-w-md"
            />
          </div>

          {/* Metin Örnekleri */}
          <div>
            <h3 className="text-lg font-medium mb-3">Metin Örnekleri</h3>
            <div className="space-y-2">
              <p className="text-sm">Küçük metin (text-sm)</p>
              <p className="text-base">Normal metin (text-base)</p>
              <p className="text-lg">Büyük metin (text-lg)</p>
              <p className="text-xl">Çok büyük metin (text-xl)</p>
              <p className="font-semibold text-brand">
                Brand color ile vurgulanmış metin
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
