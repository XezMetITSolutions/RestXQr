'use client';

import { useState, useEffect } from 'react';
import { 
  FaKeyboard, 
  FaTimes, 
  FaSearch, 
  FaHome, 
  FaUsers, 
  FaBuilding, 
  FaBell, 
  FaCogs,
  FaChartLine,
  FaCreditCard,
  FaExclamationTriangle,
  FaUserCheck,
  FaPlus,
  FaEdit,
  FaSave,
  FaSync,
  FaDownload,
  FaUpload
} from 'react-icons/fa';

interface Shortcut {
  key: string;
  description: string;
  icon: string;
  category: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export default function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const shortcuts: Shortcut[] = [
    // Navigation
    {
      key: 'Ctrl + K',
      description: 'Global arama aç/kapat',
      icon: 'FaSearch',
      category: 'navigation',
      action: () => {}
    },
    {
      key: 'Ctrl + H',
      description: 'Ana sayfaya git',
      icon: 'FaHome',
      category: 'navigation',
      action: () => {}
    },
    {
      key: 'Ctrl + U',
      description: 'Kullanıcı yönetimine git',
      icon: 'FaUsers',
      category: 'navigation',
      action: () => {}
    },
    {
      key: 'Ctrl + R',
      description: 'Restoran yönetimine git',
      icon: 'FaBuilding',
      category: 'navigation',
      action: () => {}
    },
    {
      key: 'Ctrl + N',
      description: 'Bildirim yönetimine git',
      icon: 'FaBell',
      category: 'navigation',
      action: () => {}
    },
    {
      key: 'Ctrl + S',
      description: 'Sistem yönetimine git',
      icon: 'FaCogs',
      category: 'navigation',
      action: () => {}
    },
    {
      key: 'Ctrl + A',
      description: 'Analitik sayfasına git',
      icon: 'FaChartLine',
      category: 'navigation',
      action: () => {}
    },

    // Actions
    {
      key: 'Ctrl + Shift + N',
      description: 'Yeni öğe oluştur',
      icon: 'FaPlus',
      category: 'actions',
      action: () => {}
    },
    {
      key: 'Ctrl + E',
      description: 'Düzenleme moduna geç',
      icon: 'FaEdit',
      category: 'actions',
      action: () => {}
    },
    {
      key: 'Ctrl + S',
      description: 'Kaydet',
      icon: 'FaSave',
      category: 'actions',
      action: () => {}
    },
    {
      key: 'F5',
      description: 'Sayfayı yenile',
      icon: 'FaSync',
      category: 'actions',
      action: () => {}
    },
    {
      key: 'Ctrl + Shift + D',
      description: 'Veri dışa aktar',
      icon: 'FaDownload',
      category: 'actions',
      action: () => {}
    },
    {
      key: 'Ctrl + Shift + U',
      description: 'Veri içe aktar',
      icon: 'FaUpload',
      category: 'actions',
      action: () => {}
    },

    // System
    {
      key: 'Esc',
      description: 'Modal/Form kapat',
      icon: 'FaTimes',
      category: 'system',
      action: () => {}
    },
    {
      key: 'Ctrl + ?',
      description: 'Kısayolları göster',
      icon: 'FaKeyboard',
      category: 'system',
      action: () => {}
    }
  ];

  const categories = [
    { key: 'all', label: 'Tümü', count: shortcuts.length },
    { key: 'navigation', label: 'Navigasyon', count: shortcuts.filter(s => s.category === 'navigation').length },
    { key: 'actions', label: 'İşlemler', count: shortcuts.filter(s => s.category === 'actions').length },
    { key: 'system', label: 'Sistem', count: shortcuts.filter(s => s.category === 'system').length }
  ];

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'FaSearch': return <FaSearch className="text-blue-600" />;
      case 'FaHome': return <FaHome className="text-green-600" />;
      case 'FaUsers': return <FaUsers className="text-purple-600" />;
      case 'FaBuilding': return <FaBuilding className="text-orange-600" />;
      case 'FaBell': return <FaBell className="text-yellow-600" />;
      case 'FaCogs': return <FaCogs className="text-gray-600" />;
      case 'FaChartLine': return <FaChartLine className="text-indigo-600" />;
      case 'FaPlus': return <FaPlus className="text-green-600" />;
      case 'FaEdit': return <FaEdit className="text-yellow-600" />;
      case 'FaSave': return <FaSave className="text-blue-600" />;
      case 'FaSync': return <FaSync className="text-gray-600" />;
      case 'FaDownload': return <FaDownload className="text-green-600" />;
      case 'FaUpload': return <FaUpload className="text-blue-600" />;
      case 'FaTimes': return <FaTimes className="text-red-600" />;
      case 'FaKeyboard': return <FaKeyboard className="text-gray-600" />;
      default: return <FaKeyboard className="text-gray-600" />;
    }
  };

  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shortcut.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === '?') {
        event.preventDefault();
        // This will be handled by the parent component
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FaKeyboard className="text-2xl text-gray-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Klavye Kısayolları</h2>
              <p className="text-sm text-gray-500">Hızlı erişim için kullanabileceğiniz tuş kombinasyonları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Kısayol ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mr-4">
                  {getIcon(shortcut.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-8">
              <FaKeyboard className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Arama kriterlerinize uygun kısayol bulunamadı</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded mr-2">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded ml-2">?</kbd>
                <span className="ml-2">kısayolları göster</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs">
                {filteredShortcuts.length} kısayol gösteriliyor
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
