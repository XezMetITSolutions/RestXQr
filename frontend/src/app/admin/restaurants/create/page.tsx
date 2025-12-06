'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface RestaurantFormData {
  name: string;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  cuisine: string;
  description: string;
  capacity: number;
  openingTime: string;
  closingTime: string;
  website: string;
  instagram: string;
  facebook: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'pending';
  // Admin kullanıcı bilgileri
  adminUsername: string;
  adminPassword: string;
  adminPasswordConfirm: string;
}

// Plan limitleri
const PLAN_LIMITS = {
  basic: {
    name: 'Basic',
    price: 2980,
    maxTables: 10,
    maxMenuItems: 50,
    maxStaff: 3
  },
  premium: {
    name: 'Premium',
    price: 4980,
    maxTables: 25,
    maxMenuItems: 150,
    maxStaff: 10
  },
  enterprise: {
    name: 'Enterprise',
    price: 9980,
    maxTables: 999,
    maxMenuItems: 999,
    maxStaff: 999
  }
};

export default function CreateRestaurant() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subdomainValidation, setSubdomainValidation] = useState({
    isChecking: false,
    isValid: false,
    message: ''
  });

  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    subdomain: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    cuisine: '',
    description: '',
    capacity: 0,
    openingTime: '09:00',
    closingTime: '22:00',
    website: '',
    instagram: '',
    facebook: '',
    plan: 'basic',
    status: 'pending',
    adminUsername: '',
    adminPassword: '',
    adminPasswordConfirm: ''
  });

  const handleSubdomainChange = async (subdomain: string) => {
    if (!subdomain) {
      setSubdomainValidation({ isChecking: false, isValid: false, message: '' });
      return;
    }

    // Basit format kontrolü
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      setSubdomainValidation({
        isChecking: false,
        isValid: false,
        message: 'Sadece küçük harf, rakam ve tire kullanılabilir'
      });
      return;
    }

    if (subdomain.length < 3) {
      setSubdomainValidation({
        isChecking: false,
        isValid: false,
        message: 'En az 3 karakter olmalıdır'
      });
      return;
    }

    setSubdomainValidation({ isChecking: true, isValid: false, message: 'Kontrol ediliyor...' });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Backend'den mevcut restoranları kontrol et
      const response = await fetch(`${API_URL}/staff/restaurants`);
      const result = await response.json();

      if (result.success && result.data) {
        const exists = result.data.some((r: any) => r.username === subdomain);
        
        if (exists) {
          setSubdomainValidation({
            isChecking: false,
            isValid: false,
            message: 'Bu subdomain zaten kullanılıyor'
          });
        } else {
          setSubdomainValidation({
            isChecking: false,
            isValid: true,
            message: 'Subdomain kullanılabilir'
          });
        }
      } else {
        // Kontrol edilemezse yine de devam et
        setSubdomainValidation({
          isChecking: false,
          isValid: true,
          message: 'Subdomain kullanılabilir'
        });
      }
    } catch (error) {
      // Hata durumunda yine de devam et
      setSubdomainValidation({
        isChecking: false,
        isValid: true,
        message: 'Kontrol edilemedi, devam edebilirsiniz'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subdomainValidation.isValid) {
      alert('Lütfen geçerli bir subdomain girin');
      return;
    }

    // Admin kullanıcı validasyonu
    if (!formData.adminUsername || !formData.adminPassword) {
      alert('Admin kullanıcı adı ve şifre gereklidir');
      return;
    }

    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      alert('Şifreler eşleşmiyor!');
      return;
    }

    if (formData.adminPassword.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Backend'in beklediği format
      const payload = {
        name: formData.name,
        username: formData.subdomain,
        email: formData.ownerEmail,
        password: formData.adminPassword,
        phone: formData.ownerPhone,
        address: formData.address,
        plan: formData.plan,
        adminUsername: formData.adminUsername,
        adminPassword: formData.adminPassword
      };

      const response = await fetch(`${API_URL}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        const message = `
✅ Restoran başarıyla oluşturuldu!

📋 Detaylar:
• Restoran: ${formData.name}
• Subdomain: ${formData.subdomain}.restxqr.com
• Email: ${formData.ownerEmail}
• Plan: ${formData.plan.toUpperCase()}

👤 Admin Kullanıcı:
• Kullanıcı Adı: ${formData.adminUsername}
• Şifre: ${formData.adminPassword}

🔐 Süper Admin:
• Kullanıcı Adı: restxqr
• Şifre: 01528797Mb##

🌐 Giriş URL'leri:
• Restoran: https://${formData.subdomain}.restxqr.com/isletme-giris
• Staff Login: https://${formData.subdomain}.restxqr.com/staff-login
        `;
        
        alert(message);
        router.push('/admin/restaurants');
      } else {
        alert('Hata: ' + (result.message || 'Restoran oluşturulamadı'));
      }
    } catch (error) {
      console.error('Restaurant creation error:', error);
      alert('Restoran oluşturulurken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const headerActions = (
    <div className="flex space-x-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
      >
        Geri Dön
      </button>
    </div>
  );

  return (
    <AdminLayout 
      title="Yeni Restoran Oluştur" 
      description="Yeni restoran ve subdomain oluştur"
      headerActions={headerActions}
    >
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restoran Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.subdomain}
                    onChange={(e) => {
                      setFormData({ ...formData, subdomain: e.target.value });
                      handleSubdomainChange(e.target.value);
                    }}
                    className="w-full px-3 py-2 pr-36 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="restoran-adi"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
                    .restxqr.com
                  </span>
                </div>
                <div className="mt-2">
                  {subdomainValidation.isChecking && (
                    <span className="text-blue-600 text-sm">Kontrol ediliyor...</span>
                  )}
                  {!subdomainValidation.isChecking && subdomainValidation.isValid && (
                    <span className="text-green-600 text-sm">✓ Subdomain kullanılabilir</span>
                  )}
                  {!subdomainValidation.isChecking && !subdomainValidation.isValid && subdomainValidation.message && (
                    <span className="text-red-600 text-sm">✗ {subdomainValidation.message}</span>
                  )}
                </div>
              </div>

              {/* Mutfak Türü, Kapasite, Açıklama - Gereksiz, kaldırıldı */}
            </div>
          </div>

          {/* Sahip Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Sahip Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Adres Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İl *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlçe *
                </label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posta Kodu
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Çalışma Saatleri ve Sosyal Medya - Gereksiz, kaldırıldı */}

          {/* Admin Kullanıcı Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Admin Kullanıcı Bilgileri</h2>
            <p className="text-sm text-gray-600 mb-4">Restoran için otomatik olarak bir admin kullanıcısı oluşturulacaktır.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı *
                </label>
                <input
                  type="text"
                  value={formData.adminUsername}
                  onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin veya restoran adı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre *
                </label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="En az 6 karakter"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar *
                </label>
                <input
                  type="password"
                  value={formData.adminPasswordConfirm}
                  onChange={(e) => setFormData({ ...formData, adminPasswordConfirm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Şifreyi tekrar girin"
                  required
                />
                {formData.adminPassword && formData.adminPasswordConfirm && formData.adminPassword !== formData.adminPasswordConfirm && (
                  <p className="text-red-500 text-xs mt-1">Şifreler eşleşmiyor!</p>
                )}
              </div>
            </div>
          </div>

          {/* Plan ve Durum */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Plan ve Durum</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abonelik Planı
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic - ₺{PLAN_LIMITS.basic.price}/ay</option>
                  <option value="premium">Premium - ₺{PLAN_LIMITS.premium.price}/ay</option>
                  <option value="enterprise">Enterprise - ₺{PLAN_LIMITS.enterprise.price}/ay</option>
                </select>
                
                {/* Plan Detayları */}
                {formData.plan && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                      {PLAN_LIMITS[formData.plan].name} Plan Limitleri:
                    </h3>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Maksimum Masa: {PLAN_LIMITS[formData.plan].maxTables}</li>
                      <li>• Maksimum Menü Ürünü: {PLAN_LIMITS[formData.plan].maxMenuItems}</li>
                      <li>• Maksimum Personel: {PLAN_LIMITS[formData.plan].maxStaff}</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Beklemede</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading || !subdomainValidation.isValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Oluşturuluyor...' : 'Restoran Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
