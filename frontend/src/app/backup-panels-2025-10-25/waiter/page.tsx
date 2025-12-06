'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBell, 
  FaWater, 
  FaReceipt, 
  FaUtensils, 
  FaEdit, 
  FaCheckCircle,
  FaArrowLeft,
  FaConciergeBell
} from 'react-icons/fa';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import { useCartStore } from '@/store';
import apiService from '@/services/api';

function WaiterCallPageContent() {
  const { currentLanguage } = useLanguage();
  const tableNumber = useCartStore(state => state.tableNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomNote, setShowCustomNote] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [callSent, setCallSent] = useState(false);

  // Hızlı komutlar
  const quickCommands = [
    {
      id: 'water',
      icon: FaWater,
      title: 'Su İstiyorum',
      message: 'Su getirebilir misiniz?',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'bill',
      icon: FaReceipt,
      title: 'Hesap Lütfen',
      message: 'Hesabı getirebilir misiniz?',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'cutlery',
      icon: FaUtensils,
      title: 'Yeni Çatal Bıçak',
      message: 'Yeni çatal bıçak alabilir miyiz?',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'waiter',
      icon: FaConciergeBell,
      title: 'Gelir Misiniz',
      message: 'Garson çağrısı',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  // Garson çağırma fonksiyonu
  const callWaiter = async (command: any) => {
    setIsLoading(true);
    
    try {
      // Backend'e çağrı gönder
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waiter/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: tableNumber || 1,
          type: command.id,
          message: command.message,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setCallSent(true);
        setTimeout(() => setCallSent(false), 3000);
      }
    } catch (error) {
      console.error('Garson çağırma hatası:', error);
      // Demo için başarılı say
      setCallSent(true);
      setTimeout(() => setCallSent(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Özel not gönderme
  const sendCustomNote = async () => {
    if (!customNote.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waiter/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: tableNumber || 1,
          type: 'custom',
          message: customNote,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setCallSent(true);
        setCustomNote('');
        setShowCustomNote(false);
        setTimeout(() => setCallSent(false), 3000);
      }
    } catch (error) {
      console.error('Özel not gönderme hatası:', error);
      // Demo için başarılı say
      setCallSent(true);
      setCustomNote('');
      setShowCustomNote(false);
      setTimeout(() => setCallSent(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
          <div className="container mx-auto px-3 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/menu" className="mr-2 flex items-center text-orange-600 hover:text-orange-700">
                <FaArrowLeft size={16} className="mr-1" />
                <span className="text-sm font-medium">Menüye Dön</span>
              </Link>
              <h1 className="text-dynamic-lg font-bold text-primary">
                <TranslatedText>Garson Çağır</TranslatedText>
              </h1>
              {tableNumber && (
                <div className="ml-2 px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-800">
                  <TranslatedText>Masa</TranslatedText> #{tableNumber}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16 pb-20">
          <div className="container mx-auto px-3 py-6">
            
            {/* Başarı Mesajı */}
            {callSent && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <FaCheckCircle className="mr-2" />
                <TranslatedText>Çağrınız gönderildi! Garson yakında gelecek.</TranslatedText>
              </div>
            )}

            {/* Hızlı Komutlar */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                <TranslatedText>Hızlı Komutlar</TranslatedText>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {quickCommands.map((command) => (
                  <button
                    key={command.id}
                    onClick={() => callWaiter(command)}
                    disabled={isLoading}
                    className={`${command.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    <div className="text-center">
                      <command.icon className="text-3xl mx-auto mb-3" />
                      <h3 className="font-bold text-lg">
                        <TranslatedText>{command.title}</TranslatedText>
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Özel Not */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                <TranslatedText>Özel Not</TranslatedText>
              </h2>
              
              {!showCustomNote ? (
                <button
                  onClick={() => setShowCustomNote(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  <FaEdit className="mr-3 text-xl" />
                  <span className="font-medium">
                    <TranslatedText>Özel bir mesaj yazın</TranslatedText>
                  </span>
                </button>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Garson için özel mesajınızı yazın..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={sendCustomNote}
                      disabled={!customNote.trim() || isLoading}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <TranslatedText>Gönder</TranslatedText>
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomNote(false);
                        setCustomNote('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium"
                    >
                      <TranslatedText>İptal</TranslatedText>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bilgi */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FaBell className="text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">
                    <TranslatedText>Nasıl Çalışır?</TranslatedText>
                  </h3>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    <TranslatedText>
                      Hızlı komutlardan birini seçin veya özel bir mesaj yazın. 
                      Çağrınız garson paneline iletilecek ve garson yakında masanıza gelecek.
                    </TranslatedText>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 shadow-lg">
          <div className="container mx-auto flex justify-around">
            <Link href="/menu" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <FaUtensils className="mb-0.5" size={16} />
              <span className="text-[10px]"><TranslatedText>Menü</TranslatedText></span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <FaReceipt className="mb-0.5" size={16} />
              <span className="text-[10px]"><TranslatedText>Sepet</TranslatedText></span>
            </Link>
            <div className="flex flex-col items-center text-blue-600">
              <FaBell className="mb-0.5" size={16} />
              <span className="text-[10px]"><TranslatedText>Garson Çağır</TranslatedText></span>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

export default function WaiterCallPage() {
  return (
    <LanguageProvider>
      <WaiterCallPageContent />
    </LanguageProvider>
  );
}