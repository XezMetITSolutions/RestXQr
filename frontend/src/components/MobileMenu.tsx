'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FaChartBar, 
  FaUsers, 
  FaBuilding, 
  FaBell,
  FaCreditCard,
  FaExclamationTriangle,
  FaUserCheck,
  FaCogs,
  FaChartLine,
  FaSignOutAlt,
  FaShieldAlt,
  FaTimes,
  FaBars
} from 'react-icons/fa';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, onLogout }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mr-3">
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MASAPP</h1>
              <p className="text-sm text-gray-300">Süper Yönetici</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-6">
          <nav className="space-y-2">
            {/* Ana Menü */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ana Menü</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/admin" 
                    className="flex items-center p-3 rounded-lg bg-blue-600 text-white"
                    onClick={onClose}
                  >
                    <FaChartBar className="mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/restaurants" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaBuilding className="mr-3" />
                    Restoran Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/users" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaUsers className="mr-3" />
                    Kullanıcı Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/notifications" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaBell className="mr-3" />
                    Bildirimler
                  </Link>
                </li>
              </ul>
            </div>

            {/* Raporlar ve Analitik */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Raporlar & Analitik</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/admin/subscriptions" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaCreditCard className="mr-3" />
                    Abonelik Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/payment-errors" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaExclamationTriangle className="mr-3" />
                    Ödeme Hataları
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/user-approvals" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaUserCheck className="mr-3" />
                    Kullanıcı Onayları
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/notifications" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaBell className="mr-3" />
                    Bildirim Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/system" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaCogs className="mr-3" />
                    Sistem Yönetimi
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/analytics" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
                    onClick={onClose}
                  >
                    <FaChartLine className="mr-3" />
                    Analitik
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        
        {/* Logout Button */}
        <div className="p-6">
          <button 
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center justify-center w-full p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            <FaSignOutAlt className="mr-3" />
            Çıkış
          </button>
        </div>
      </div>
    </div>
  );
}
