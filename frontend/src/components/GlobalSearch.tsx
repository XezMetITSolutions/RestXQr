'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  FaSearch, 
  FaTimes, 
  FaUser, 
  FaBuilding, 
  FaCreditCard, 
  FaExclamationTriangle, 
  FaBell, 
  FaCogs, 
  FaChartLine,
  FaArrowRight,
  FaKeyboard
} from 'react-icons/fa';

interface SearchResult {
  id: string;
  type: 'page' | 'user' | 'restaurant' | 'subscription' | 'payment_error' | 'notification' | 'system';
  title: string;
  description: string;
  url: string;
  icon: string;
  category: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Debounced search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Demo: Arama sonuçları
  const searchData: SearchResult[] = [
    {
      id: 'users',
      type: 'page',
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcıları görüntüle ve yönet',
      url: '/admin/users',
      icon: 'FaUser',
      category: 'Sayfa'
    },
    {
      id: 'restaurants',
      type: 'page',
      title: 'Restoran Yönetimi',
      description: 'Restoranları görüntüle ve yönet',
      url: '/admin/restaurants',
      icon: 'FaBuilding',
      category: 'Sayfa'
    },
    {
      id: 'subscriptions',
      type: 'page',
      title: 'Abonelik Yönetimi',
      description: 'Abonelikleri görüntüle ve yönet',
      url: '/admin/subscriptions',
      icon: 'FaCreditCard',
      category: 'Sayfa'
    },
    {
      id: 'payment-errors',
      type: 'page',
      title: 'Ödeme Hataları',
      description: 'Ödeme hatalarını görüntüle ve yönet',
      url: '/admin/payment-errors',
      icon: 'FaExclamationTriangle',
      category: 'Sayfa'
    },
    {
      id: 'notifications',
      type: 'page',
      title: 'Bildirim Yönetimi',
      description: 'Bildirimleri görüntüle ve yönet',
      url: '/admin/notifications',
      icon: 'FaBell',
      category: 'Sayfa'
    },
    {
      id: 'system',
      type: 'page',
      title: 'Sistem Yönetimi',
      description: 'Sistem ayarlarını yönet',
      url: '/admin/system',
      icon: 'FaCogs',
      category: 'Sayfa'
    },
    {
      id: 'analytics',
      type: 'page',
      title: 'Analitik ve Raporlar',
      description: 'Sistem analitiklerini görüntüle',
      url: '/admin/analytics',
      icon: 'FaChartLine',
      category: 'Sayfa'
    },
    {
      id: 'user-1',
      type: 'user',
      title: 'Ahmet Yılmaz',
      description: 'Pizza Palace - Yönetici',
      url: '/admin/users/user-1',
      icon: 'FaUser',
      category: 'Kullanıcı'
    },
    {
      id: 'restaurant-1',
      type: 'restaurant',
      title: 'Pizza Palace',
      description: 'İtalyan Mutfağı - Aktif',
      url: '/admin/restaurants/rest-1',
      icon: 'FaBuilding',
      category: 'Restoran'
    },
    {
      id: 'subscription-1',
      type: 'subscription',
      title: 'Pizza Palace Aboneliği',
      description: 'Premium Plan - 1 Yıl',
      url: '/admin/subscriptions/sub-1',
      icon: 'FaCreditCard',
      category: 'Abonelik'
    }
  ];

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'FaUser': return <FaUser className="text-blue-600" />;
      case 'FaBuilding': return <FaBuilding className="text-orange-600" />;
      case 'FaCreditCard': return <FaCreditCard className="text-green-600" />;
      case 'FaExclamationTriangle': return <FaExclamationTriangle className="text-red-600" />;
      case 'FaBell': return <FaBell className="text-purple-600" />;
      case 'FaCogs': return <FaCogs className="text-gray-600" />;
      case 'FaChartLine': return <FaChartLine className="text-indigo-600" />;
      default: return <FaSearch className="text-gray-600" />;
    }
  };

  const getTypeClass = (type: string) => {
    switch(type) {
      case 'page': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'restaurant': return 'bg-orange-100 text-orange-800';
      case 'subscription': return 'bg-purple-100 text-purple-800';
      case 'payment_error': return 'bg-red-100 text-red-800';
      case 'notification': return 'bg-yellow-100 text-yellow-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch(type) {
      case 'page': return 'Sayfa';
      case 'user': return 'Kullanıcı';
      case 'restaurant': return 'Restoran';
      case 'subscription': return 'Abonelik';
      case 'payment_error': return 'Ödeme Hatası';
      case 'notification': return 'Bildirim';
      case 'system': return 'Sistem';
      default: return type;
    }
  };

  // Memoized search results for performance
  const filteredResults = useMemo(() => {
    if (debouncedSearchTerm.length === 0) return [];
    
    return searchData.filter(item =>
      item.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm.length > 0) {
      setIsLoading(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        setResults(filteredResults);
        setIsLoading(false);
      }, 200);
      
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, filteredResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setResults([]);
        setSelectedIndex(-1);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
        setResults([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
    setSelectedIndex(-1);
  }, [router]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleResultClick(results[selectedIndex]);
      }
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
      >
        <FaSearch className="text-sm" />
        <span className="hidden md:block">Ara...</span>
        <div className="hidden md:flex items-center space-x-1 text-xs text-gray-500">
          <FaKeyboard className="text-xs" />
          <span>Ctrl+K</span>
        </div>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ara... (Ctrl+K ile aç/kapat)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Aranıyor...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                        index === selectedIndex ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getIcon(result.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeClass(result.type)}`}>
                            {getTypeText(result.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {result.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <FaArrowRight className="text-gray-400 text-sm" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchTerm.length > 0 ? (
                <div className="p-8 text-center">
                  <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Arama sonucu bulunamadı</p>
                  <p className="text-sm text-gray-400 mt-1">
                    "{searchTerm}" için sonuç bulunamadı
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Arama yapmak için yazmaya başlayın</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Sayfalar, kullanıcılar, restoranlar ve daha fazlası
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <FaKeyboard className="mr-1" />
                    <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">↑↓</kbd>
                    <span className="ml-1">navigate</span>
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Enter</kbd>
                    <span className="ml-1">select</span>
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Esc</kbd>
                    <span className="ml-1">close</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <FaKeyboard className="mr-1" />
                  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Ctrl</kbd>
                  <span className="mx-1">+</span>
                  <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">K</kbd>
                  <span className="ml-1">to open</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
