'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaUsers, 
  FaUtensils, 
  FaChartLine, 
  FaClipboardList, 
  FaBell, 
  FaCog, 
  FaQuestionCircle,
  FaArrowLeft
} from 'react-icons/fa';

export default function AdminPage() {
  const [notifications, setNotifications] = useState(3);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/restoranlar" className="mr-3">
                <FaArrowLeft size={18} />
              </Link>
              <h1 className="text-2xl font-bold">MasApp Yönetim Paneli</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaBell size={20} className="cursor-pointer" />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </div>
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-blue-700 font-bold">
                AK
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Günlük Sipariş</h3>
              <FaClipboardList size={24} />
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-sm opacity-80 mt-2">Dün: 18 (+33%)</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Günlük Gelir</h3>
              <FaChartLine size={24} />
            </div>
            <p className="text-3xl font-bold">4.250 ₺</p>
            <p className="text-sm opacity-80 mt-2">Dün: 3.840 ₺ (+10%)</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Aktif Masalar</h3>
              <FaUtensils size={24} />
            </div>
            <p className="text-3xl font-bold">8/12</p>
            <p className="text-sm opacity-80 mt-2">Doluluk: %66</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Personel</h3>
              <FaUsers size={24} />
            </div>
            <p className="text-3xl font-bold">6</p>
            <p className="text-sm opacity-80 mt-2">Aktif: 4</p>
          </div>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/restoranlar/admin/kullanicilar" className="transform transition-transform hover:scale-105">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-indigo-500 h-2"></div>
              <div className="p-6">
                <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <FaUsers className="text-indigo-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Kullanıcı Yönetimi</h3>
                <p className="text-gray-600 text-sm">
                  Personel hesaplarını ve yetkilerini yönetin
                </p>
              </div>
            </div>
          </Link>
          
          <Link href="/restoranlar/admin/menu" className="transform transition-transform hover:scale-105">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-emerald-500 h-2"></div>
              <div className="p-6">
                <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <FaUtensils className="text-emerald-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Menü Yönetimi</h3>
                <p className="text-gray-600 text-sm">
                  Menü öğelerinizi ve kategorileri düzenleyin
                </p>
              </div>
            </div>
          </Link>
          
          <Link href="/restoranlar/admin/finans" className="transform transition-transform hover:scale-105">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-500 h-2"></div>
              <div className="p-6">
                <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <FaChartLine className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Finans & Raporlama</h3>
                <p className="text-gray-600 text-sm">
                  Gelir-gider takibi ve satış raporları
                </p>
              </div>
            </div>
          </Link>
          
          <Link href="/restoranlar/admin/siparisler" className="transform transition-transform hover:scale-105">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-amber-500 h-2"></div>
              <div className="p-6">
                <div className="bg-amber-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <FaClipboardList className="text-amber-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sipariş Takibi</h3>
                <p className="text-gray-600 text-sm">
                  Siparişleri görüntüleyin ve yönetin
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <FaUsers className="text-blue-600" />
              </div>
              <span className="text-sm">Kullanıcı Ekle</span>
            </button>
            
            <button className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <FaUtensils className="text-green-600" />
              </div>
              <span className="text-sm">Menü Öğesi Ekle</span>
            </button>
            
            <button className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50">
              <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <FaCog className="text-purple-600" />
              </div>
              <span className="text-sm">Ayarlar</span>
            </button>
            
            <button className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50">
              <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <FaQuestionCircle className="text-orange-600" />
              </div>
              <span className="text-sm">Yardım</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Son Aktiviteler</h2>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaClipboardList className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Yeni Sipariş #1234</p>
                  <p className="text-sm text-gray-500">Masa 5 - 3 dakika önce</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <FaUsers className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Ahmet K. giriş yaptı</p>
                  <p className="text-sm text-gray-500">15 dakika önce</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <FaUtensils className="text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Menü güncellendi</p>
                  <p className="text-sm text-gray-500">1 saat önce</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
