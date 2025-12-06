'use client';

import { useState } from 'react';
import { FaTimes, FaTint, FaBroom, FaReceipt, FaUtensils, FaPaperPlane, FaBell } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useCartStore } from '@/store';

interface QuickServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCall?: (serviceType: string, customNote?: string) => void;
}

export default function QuickServiceModal({ isOpen, onClose, onServiceCall }: QuickServiceModalProps) {
  const { currentLanguage } = useLanguage();
  const { restaurants } = useRestaurantStore();
  const tableNumber = useCartStore(state => state.tableNumber);
  const [customNote, setCustomNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const getCurrentRestaurant = () => {
    if (typeof window === 'undefined') return null;
    if (!restaurants || !Array.isArray(restaurants)) return null;
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    const mainDomains = ['localhost', 'www', 'guzellestir'];

    if (mainDomains.includes(subdomain)) return null;
    return restaurants.find((r: { username: string }) => r.username === subdomain);
  };

  const currentRestaurant = getCurrentRestaurant();
  const isTurkish = currentLanguage === 'Turkish';

  const quickServices = [
    {
      id: 'water',
      icon: FaTint,
      title: 'Su Getir',
      message: 'Su getirebilir misiniz?'
    },
    {
      id: 'bill',
      icon: FaReceipt,
      title: 'Hesap Lütfen',
      message: 'Hesabı getirebilir misiniz?'
    },
    {
      id: 'utensils',
      icon: FaUtensils,
      title: 'Yeni Çatal Bıçak',
      message: 'Yeni çatal bıçak getirebilir misiniz?'
    },
    {
      id: 'come_here',
      icon: FaBell,
      title: 'Buraya Gelir misiniz?',
      message: 'Buraya gelir misiniz?'
    }
  ] as const;

  const handleQuickService = async (service: typeof quickServices[number]) => {
    if (onServiceCall) {
      // Use parent component's service call handler if provided
      onServiceCall(service.id, service.message);
      onClose();
      return;
    }

    // Fallback to internal API call
    if (!currentRestaurant?.id || !tableNumber) {
      setToastMessage('Masa numarası bulunamadı');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/service-call/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: currentRestaurant.id,
          tableNumber: tableNumber,
          message: service.message,
          type: service.id
        })
      });

      if (response.ok) {
        setToastMessage(`${service.title} talebi gönderildi!`);
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        setToastMessage('Talep gönderilemedi');
      }
    } catch (error) {
      setToastMessage('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomNote = async () => {
    if (!customNote.trim()) {
      setToastMessage('Lütfen bir not yazın');
      return;
    }

    if (onServiceCall) {
      // Use parent component's service call handler if provided
      onServiceCall('custom_request', customNote);
      setCustomNote('');
      onClose();
      return;
    }

    // Fallback to internal API call
    if (!currentRestaurant?.id || !tableNumber) {
      setToastMessage('Masa numarası bulunamadı');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/service-call/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: currentRestaurant.id,
          tableNumber: tableNumber,
          message: customNote,
          type: 'custom_request'
        })
      });

      if (response.ok) {
        setToastMessage('Özel notunuz gönderildi!');
        setCustomNote('');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        setToastMessage('Not gönderilemedi');
      }
    } catch (error) {
      setToastMessage('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-60 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 rounded-t-xl">
          <h3 className="text-xl font-semibold text-gray-800">
            <TranslatedText>Hızlı Servis</TranslatedText>
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm ml-auto inline-flex items-center"
          >
            <FaTimes className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Table Number */}
          {tableNumber && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <TranslatedText>Masa</TranslatedText> #{tableNumber}
              </div>
            </div>
          )}

          {/* Quick Service Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {quickServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => handleQuickService(service)}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconComponent className="text-2xl text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-800 text-center">
                    {service.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Note */}
          <div className="space-y-3 mt-4">
            <label htmlFor="custom-note" className="block text-sm font-medium text-gray-700">
              <TranslatedText>Özel Not</TranslatedText>
            </label>
            <textarea
              id="custom-note"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Özel isteğinizi yazın..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={handleCustomNote}
              disabled={isLoading || !customNote.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaPaperPlane />
              <TranslatedText>Gönder</TranslatedText>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}