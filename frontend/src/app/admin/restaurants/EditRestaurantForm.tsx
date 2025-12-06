'use client';

import { useState, useEffect } from 'react';
import useRestaurantStore from '@/store/useRestaurantStore';
import { Restaurant } from '@/types';
import { FaTimes, FaSave, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaLock, FaGlobe } from 'react-icons/fa';

interface EditRestaurantFormProps {
  restaurantId: string;
  onClose: () => void;
}

export default function EditRestaurantForm({ restaurantId, onClose }: EditRestaurantFormProps) {
  const { restaurants, updateRestaurant } = useRestaurantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    category: 'Restoran',
    tableCount: 10,
    status: 'active',
    workingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    },
    features: [] as string[],
    settings: {
      allowOnlineOrders: true,
      requirePhoneVerification: false,
      autoAcceptOrders: false,
      showPrices: true,
      showImages: true
    }
  });

  useEffect(() => {
    const foundRestaurant = restaurants.find(r => r.id === restaurantId);
    if (foundRestaurant) {
      setRestaurant(foundRestaurant);
      setFormData({
        name: foundRestaurant.name || '',
        address: foundRestaurant.address || '',
        phone: foundRestaurant.phone || '',
        email: foundRestaurant.email || '',
        website: foundRestaurant.website || '',
        ownerName: foundRestaurant.ownerName || '',
        ownerEmail: foundRestaurant.ownerEmail || '',
        ownerPhone: foundRestaurant.ownerPhone || '',
        category: foundRestaurant.category || 'Restoran',
        tableCount: foundRestaurant.tableCount || 10,
        status: foundRestaurant.status || 'active',
        workingHours: foundRestaurant.workingHours || formData.workingHours,
        features: foundRestaurant.features || [],
        settings: foundRestaurant.settings || formData.settings
      });
    }
  }, [restaurantId, restaurants]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant) return;

    setIsLoading(true);

    try {
      const updatedData: Partial<Restaurant> = {
      name: formData.name,
        address: formData.address,
        phone: formData.phone,
      email: formData.email,
        website: formData.website,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        category: formData.category,
      tableCount: formData.tableCount,
        status: formData.status,
        workingHours: formData.workingHours,
        features: formData.features,
        settings: formData.settings,
        updatedAt: new Date().toISOString()
      };

      await updateRestaurant(restaurantId, updatedData);
      alert('Restoran başarıyla güncellendi!');
    onClose();
    } catch (error) {
      console.error('Restaurant update error:', error);
      alert('Restoran güncellenirken hata oluştu!');
    } finally {
      setIsLoading(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Restoran bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaBuilding className="mr-2" />
            Temel Bilgiler
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restoran Adı *</label>
                <input
                  type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                  required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Restoran adını girin"
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Restoran">Restoran</option>
                <option value="İtalyan">İtalyan</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Japon">Japon</option>
                <option value="Kahve">Kahve</option>
                <option value="Et Restoranı">Et Restoranı</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Masa Sayısı</label>
                <input
                type="number"
                name="tableCount"
                value={formData.tableCount}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="pending">Beklemede</option>
                <option value="suspended">Askıya Alındı</option>
              </select>
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            İletişim Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adres *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                  required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tam adres bilgisi"
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                name="phone"
                  value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+90 555 123 45 67"
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="info@restoran.com"
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.restoran.com"
                />
              </div>
            </div>
          </div>

        {/* Sahip Bilgileri */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaUser className="mr-2" />
            Sahip Bilgileri
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sahip Adı</label>
                  <input
                    type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sahip adı soyadı"
                  />
                </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sahip E-posta</label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sahip@restoran.com"
              />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sahip Telefon</label>
                  <input
                type="tel"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+90 555 123 45 67"
                  />
                </div>
              </div>
            </div>

        {/* Özellikler */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaGlobe className="mr-2" />
            Özellikler
            </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'qr-menu', label: 'QR Menü' },
              { key: 'online-ordering', label: 'Online Sipariş' },
              { key: 'table-management', label: 'Masa Yönetimi' },
              { key: 'payment-integration', label: 'Ödeme Entegrasyonu' },
              { key: 'analytics', label: 'Analitik' },
              { key: 'multi-language', label: 'Çoklu Dil' }
            ].map(feature => (
              <label key={feature.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature.key)}
                  onChange={() => handleFeatureToggle(feature.key)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{feature.label}</span>
              </label>
            ))}
              </div>
            </div>

        {/* Butonlar */}
        <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
            <FaTimes className="inline mr-2" />
          İptal
        </button>
        <button
          type="submit"
          disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <FaSave className="inline mr-2" />
            {isLoading ? 'Güncelleniyor...' : 'Güncelle'}
        </button>
      </div>
    </form>
    </div>
  );
}
