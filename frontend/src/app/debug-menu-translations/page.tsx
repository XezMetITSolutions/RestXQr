'use client';

import React, { useState } from 'react';
import { FaLanguage, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

export default function DebugMenuTranslations() {
  const [productName, setProductName] = useState('Margherita Pizza');
  const [productDescription, setProductDescription] = useState('Klasik domates sosu, mozzarella peyniri ve taze fesleğen');
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<{[key: string]: {name: string, description: string}}>({});
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com');

  const languages = ['en', 'tr', 'ar', 'de', 'fr', 'es', 'it', 'ru'];
  
  const languageNames: {[key: string]: string} = {
    'tr': 'Türkçe',
    'en': 'English',
    'ar': 'العربية',
    'de': 'Deutsch',
    'fr': 'Français',
    'es': 'Español',
    'it': 'Italiano',
    'ru': 'Русский'
  };

  const handleTranslate = async () => {
    if (!productName.trim()) {
      setError('Lütfen ürün adı girin');
      return;
    }

    setLoading(true);
    setError(null);
    setTranslations({});

    try {
      const newTranslations: {[key: string]: {name: string, description: string}} = {};

      for (const lang of languages) {
        try {
          // Türkçe için çeviri yapmaya gerek yok
          if (lang === 'tr') {
            newTranslations[lang] = {
              name: productName,
              description: productDescription || ''
            };
            continue;
          }

          // Çeviri API'sini kullan
          const languageMap: {[key: string]: string} = {
            'en': 'English',
            'ar': 'Arabic',
            'de': 'German',
            'fr': 'French',
            'es': 'Spanish',
            'it': 'Italian',
            'ru': 'Russian'
          };

          const targetLanguage = languageMap[lang] || 'English';

          // Ürün adı çevirisi
          const nameResponse = await fetch(`${apiUrl}/api/translate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: productName,
              targetLanguage: targetLanguage
            })
          });

          if (!nameResponse.ok) {
            throw new Error(`HTTP ${nameResponse.status}: ${nameResponse.statusText}`);
          }

          // Açıklama çevirisi (varsa)
          let descResponse = null;
          if (productDescription) {
            descResponse = await fetch(`${apiUrl}/api/translate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: productDescription,
                targetLanguage: targetLanguage
              })
            });

            if (!descResponse.ok) {
              throw new Error(`HTTP ${descResponse.status}: ${descResponse.statusText}`);
            }
          }

          const nameData = await nameResponse.json();
          const descData = descResponse ? await descResponse.json() : { translatedText: '' };

          newTranslations[lang] = {
            name: nameData.translatedText || productName,
            description: descData.translatedText || productDescription || ''
          };

          console.log(`✅ ${lang} çevirisi tamamlandı:`, newTranslations[lang]);
        } catch (error) {
          console.error(`❌ Çeviri hatası (${lang}):`, error);
          // Hata durumunda orijinal metni kullan
          newTranslations[lang] = {
            name: productName,
            description: productDescription || ''
          };
        }
      }

      setTranslations(newTranslations);
      console.log('✅ Tüm çeviriler tamamlandı:', newTranslations);
    } catch (error) {
      console.error('❌ Çeviriler yüklenirken hata:', error);
      setError(`Çeviri hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSingleTranslation = async (lang: string, text: string) => {
    const languageMap: {[key: string]: string} = {
      'en': 'English',
      'ar': 'Arabic',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'ru': 'Russian'
    };

    const targetLanguage = languageMap[lang] || 'English';
    
    try {
      console.log(`🧪 Test çevirisi başlatılıyor: ${text} -> ${targetLanguage}`);
      
      const response = await fetch(`${apiUrl}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          targetLanguage: targetLanguage
        })
      });

      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error: ${response.status}`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Çeviri sonucu:`, data);
      
      return data.translatedText || text;
    } catch (error) {
      console.error(`❌ Test çevirisi hatası:`, error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FaLanguage className="text-blue-600" />
            Menü Çevirileri Debug Sayfası
          </h1>
          <p className="text-gray-600">
            Ürün çevirilerini test etmek için bu sayfayı kullanın
          </p>
        </div>

        {/* API URL Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Base URL
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://masapp-backend.onrender.com"
          />
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ürün Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı (Türkçe)
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Margherita Pizza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Açıklaması (Türkçe)
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Klasik domates sosu, mozzarella peyniri ve taze fesleğen"
              />
            </div>

            <button
              onClick={handleTranslate}
              disabled={loading || !productName.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Çeviriliyor...
                </>
              ) : (
                <>
                  <FaLanguage />
                  Tüm Dillere Çevir
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <FaTimes className="text-red-600" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Translations Display */}
        {Object.entries(translations).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCheck className="text-green-600" />
              Çeviriler ({Object.entries(translations).length} dil)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(translations).map(([lang, translation]) => (
                <div key={lang} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {lang.toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-lg">{languageNames[lang] || lang}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ürün Adı</label>
                      <p className="text-gray-900 font-medium mt-1 break-words">{translation.name}</p>
                    </div>
                    {translation.description && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Açıklama</label>
                        <p className="text-gray-700 mt-1 break-words text-sm">{translation.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Single Translation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tekil Çeviri Testi</h2>
          <div className="space-y-3">
            {languages.filter(lang => lang !== 'tr').map((lang) => (
              <button
                key={lang}
                onClick={async () => {
                  try {
                    const result = await handleTestSingleTranslation(lang, productName);
                    alert(`${languageNames[lang]}: ${result}`);
                  } catch (error) {
                    alert(`Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                  }
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center justify-between transition-colors"
              >
                <span className="font-medium">{languageNames[lang]} ({lang})</span>
                <span className="text-sm text-gray-500">Test Et</span>
              </button>
            ))}
          </div>
        </div>

        {/* API Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">API Bilgileri</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Endpoint:</strong> {apiUrl}/api/translate</p>
            <p><strong>Method:</strong> POST</p>
            <p><strong>Body:</strong> {`{ text: string, targetLanguage: string }`}</p>
            <p><strong>Response:</strong> {`{ translatedText: string }`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

