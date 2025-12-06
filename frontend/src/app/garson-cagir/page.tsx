'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBell, FaArrowLeft, FaGlassWhiskey, FaFileInvoiceDollar, FaSprayCan, FaHandHolding, FaCheckCircle, FaShoppingCart, FaUtensils } from 'react-icons/fa';
import { useCartStore } from '@/store';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

function GarsonCagirContent() {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const tableNumber = useCartStore(state => state.tableNumber);
  const cartItems = useCartStore(state => state.items);
  const { settings } = useBusinessSettingsStore();
  const primary = settings.branding.primaryColor;
  const [isClient, setIsClient] = useState(false);
  
  const [specialRequest, setSpecialRequest] = useState('');
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const cartCount = isClient ? cartItems.length : 0;

  const handleQuickRequest = (type: string) => {
    const newRequest = {
      id: Date.now(),
      type,
      timestamp: new Date().toISOString()
    };
    
    setActiveRequests(prev => [...prev, newRequest]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    
    // TODO: Backend'e gönder
    console.log('Garson talebi gönderildi:', type);
  };

  const handleSpecialRequest = () => {
    if (!specialRequest.trim()) return;
    
    const newRequest = {
      id: Date.now(),
      type: 'custom',
      message: specialRequest,
      timestamp: new Date().toISOString()
    };
    
    setActiveRequests(prev => [...prev, newRequest]);
    setSpecialRequest('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    
    // TODO: Backend'e gönder
    console.log('Özel istek gönderildi:', specialRequest);
  };

  const removeRequest = (id: number) => {
    setActiveRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link 
            href="/menu"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div className="flex items-center gap-2">
            <FaBell size={22} style={{ color: primary }} />
            <h1 className="text-xl font-bold" style={{ color: primary }}>
              <TranslatedText>Garson Çağır</TranslatedText>
            </h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <FaCheckCircle size={20} />
            <span className="font-semibold">İstek gönderildi!</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Masa Numarası */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border-2" style={{ borderColor: primary + '20' }}>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Masa Numaranız</span>
            <div className="px-4 py-2 rounded-full font-bold text-lg" style={{ backgroundColor: primary + '20', color: primary }}>
              #{tableNumber || 'Bilinmiyor'}
            </div>
          </div>
        </div>

        {/* Hızlı İstekler */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Hızlı İstekler</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleQuickRequest('water')}
              className="flex flex-col items-center justify-center gap-3 py-6 rounded-2xl shadow-sm hover:shadow-lg active:scale-95 transition-all duration-200"
              style={{ backgroundColor: primary, color: 'white' }}
            >
              <FaGlassWhiskey size={32} />
              <span className="text-sm font-semibold">Su Getir</span>
            </button>
            <button 
              onClick={() => handleQuickRequest('bill')}
              className="flex flex-col items-center justify-center gap-3 py-6 rounded-2xl shadow-sm hover:shadow-lg active:scale-95 transition-all duration-200"
              style={{ backgroundColor: primary, color: 'white' }}
            >
              <FaFileInvoiceDollar size={32} />
              <span className="text-sm font-semibold">Hesap İste</span>
            </button>
            <button 
              onClick={() => handleQuickRequest('clean')}
              className="flex flex-col items-center justify-center gap-3 py-6 rounded-2xl shadow-sm hover:shadow-lg active:scale-95 transition-all duration-200"
              style={{ backgroundColor: primary, color: 'white' }}
            >
              <FaSprayCan size={32} />
              <span className="text-sm font-semibold">Masayı Temizle</span>
            </button>
            <button 
              onClick={() => handleQuickRequest('help')}
              className="flex flex-col items-center justify-center gap-3 py-6 rounded-2xl shadow-sm hover:shadow-lg active:scale-95 transition-all duration-200"
              style={{ backgroundColor: primary, color: 'white' }}
            >
              <FaHandHolding size={32} />
              <span className="text-sm font-semibold">Yardım Gerekiyor</span>
            </button>
          </div>
        </div>

        {/* Özel İstek */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Özel İstek</h2>
          <textarea 
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            placeholder="İsteğinizi buraya yazın..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 resize-none transition-all"
            rows={5}
          />
          <button 
            onClick={handleSpecialRequest}
            disabled={!specialRequest.trim()}
            className="w-full mt-4 py-4 rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primary, color: 'white' }}
          >
            İstek Gönder
          </button>
        </div>

        {/* Aktif İstekler */}
        {activeRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: primary }}>Aktif İstekler</h2>
            <div className="space-y-3">
              {activeRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {request.type === 'water' && '💧 Su Getir'}
                      {request.type === 'bill' && '💰 Hesap İste'}
                      {request.type === 'clean' && '🧹 Masayı Temizle'}
                      {request.type === 'help' && '🤝 Yardım Gerekiyor'}
                      {request.type === 'custom' && `📝 ${request.message}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeRequest(request.id)}
                    className="ml-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bilgilendirme */}
        <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-100">
          <p className="text-sm text-blue-800 text-center">
            ℹ️ İsteğiniz garson ekibimize iletilecektir. En kısa sürede size yardımcı olacağız.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 shadow-lg z-50">
        <div className="container mx-auto flex justify-around">
          <Link href="/menu" className="flex flex-col items-center" style={{ color: primary }}>
            <FaUtensils className="mb-0.5" size={16} />
            <span className="text-[10px]"><TranslatedText>Menü</TranslatedText></span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center" style={{ color: primary }}>
            <div className="relative">
              <FaShoppingCart className="mb-0.5" size={16} />
              {isClient && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px]"><TranslatedText>Sepet</TranslatedText></span>
          </Link>
          <div className="flex flex-col items-center" style={{ color: primary }}>
            <FaBell className="mb-0.5" size={16} />
            <span className="text-[10px] font-bold"><TranslatedText>Garson Çağır</TranslatedText></span>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function GarsonCagirPage() {
  return (
    <LanguageProvider>
      <GarsonCagirContent />
    </LanguageProvider>
  );
}
