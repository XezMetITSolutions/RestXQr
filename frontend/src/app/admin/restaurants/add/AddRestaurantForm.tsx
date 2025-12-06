'use client';

import { useState } from 'react';
import useRestaurantStore from '@/store/useRestaurantStore';
import { Restaurant } from '@/types';
import { FaTimes, FaSave, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaLock, FaGlobe } from 'react-icons/fa';

interface AddRestaurantFormProps {
  onClose: () => void;
}

export default function AddRestaurantForm({ onClose }: AddRestaurantFormProps) {
  const { createRestaurant } = useRestaurantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    city: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }

    if (!formData.name || !formData.subdomain || !formData.city || !formData.address || !formData.username || !formData.password) {
      alert('Tüm alanlar gereklidir!');
      return;
    }

    setIsLoading(true);

    try {
      // Backend'in beklediği format
      const newRestaurant = {
      name: formData.name,
      username: formData.username,
      password: formData.password,
        email: `${formData.username}@${formData.subdomain}.com`, // Otomatik email oluştur
        phone: `+90555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`, // Otomatik telefon
        address: `${formData.address}, ${formData.city}` // Şehir ile birleştir
      };

      await createRestaurant(newRestaurant);
      alert('Restoran başarıyla eklendi!');
      onClose();
    } catch (error) {
      console.error('Restaurant creation error:', error);
      alert('Restoran eklenirken hata oluştu!');
    } finally {
      setIsLoading(false);
    }
  };

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain *</label>
                <input
                  type="text"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleInputChange}
                  required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="restoran-adi (sadece küçük harf, tire ve rakam)"
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şehir *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                  required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Şehir seçin</option>
                <option value="İstanbul">İstanbul</option>
                <option value="Ankara">Ankara</option>
                <option value="İzmir">İzmir</option>
                <option value="Bursa">Bursa</option>
                <option value="Antalya">Antalya</option>
                <option value="Adana">Adana</option>
                <option value="Konya">Konya</option>
                <option value="Gaziantep">Gaziantep</option>
                <option value="Mersin">Mersin</option>
                <option value="Diyarbakır">Diyarbakır</option>
              </select>
              </div>
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
            </div>
          </div>


        {/* Admin Hesabı */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaLock className="mr-2" />
            Admin Hesabı
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı *</label>
                  <input
                    type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                autoComplete="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin_username"
                  />
                </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre *</label>
                  <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Güçlü şifre girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre Tekrar *</label>
                  <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Şifreyi tekrar girin"
              />
              </div>
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
            {isLoading ? 'Ekleniyor...' : 'Restoran Ekle'}
        </button>
      </div>
    </form>
    </div>
  );
}
