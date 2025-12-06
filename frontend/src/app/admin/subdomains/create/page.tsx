'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft,
  FaSave,
  FaGlobe,
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaServer,
  FaCheckCircle,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';

export default function CreateSubdomainPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    subdomain: '',
    restaurantName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    address: '',
    city: '',
    district: '',
    plan: 'basic' as 'basic' | 'premium' | 'pro',
    dnsProvider: 'cloudflare',
    targetIp: '104.21.0.0'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Subdomain değiştiğinde kontrol et
    if (name === 'subdomain') {
      checkSubdomainAvailability(value);
    }
  };

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setIsCheckingSubdomain(true);
    try {
      const response = await fetch(`/api/subdomains/validate/${subdomain}`);
      const data = await response.json();
      setSubdomainAvailable(!data.exists);
    } catch (error) {
      console.error('Subdomain kontrol hatası:', error);
      setSubdomainAvailable(null);
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/subdomains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Başarılı - subdomain listesine yönlendir
        router.push('/admin/subdomains');
      } else {
        console.error('Subdomain oluşturma hatası:', data.error);
        // Hata mesajı göster
      }
    } catch (error) {
      console.error('Subdomain oluşturma hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center">
            <Link
              href="/admin/subdomains"
              className="text-gray-600 hover:text-gray-800 mr-4"
            >
              <FaArrowLeft className="text-xl" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Subdomain Oluştur</h1>
              <p className="text-gray-600 mt-1">İşletme için subdomain oluştur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sol Kolon - Subdomain Ayarları */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FaGlobe className="mr-2" />
                  Subdomain Ayarları
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subdomain *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="subdomain"
                        value={formData.subdomain}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="kardesler"
                        required
                      />
                      <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium">
                        .guzellestir.com
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {isCheckingSubdomain && (
                        <FaSpinner className="animate-spin text-blue-500" />
                      )}
                      {!isCheckingSubdomain && subdomainAvailable === true && (
                        <FaCheckCircle className="text-green-500" />
                      )}
                      {!isCheckingSubdomain && subdomainAvailable === false && (
                        <FaTimes className="text-red-500" />
                      )}
                      <span className={`text-sm ${
                        subdomainAvailable === true ? 'text-green-600' : 
                        subdomainAvailable === false ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {isCheckingSubdomain ? 'Kontrol ediliyor...' : 
                         subdomainAvailable === true ? 'Mevcut' : 
                         subdomainAvailable === false ? 'Kullanımda' : 'Subdomain girin'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      3-20 karakter, sadece küçük harf, rakam ve tire
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan *
                    </label>
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="basic">Basic - ₺99/ay</option>
                      <option value="premium">Premium - ₺199/ay</option>
                      <option value="pro">Pro - ₺399/ay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNS Sağlayıcı
                    </label>
                    <select
                      name="dnsProvider"
                      value={formData.dnsProvider}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cloudflare">Cloudflare</option>
                      <option value="route53">AWS Route 53</option>
                      <option value="godaddy">GoDaddy</option>
                      <option value="namecheap">Namecheap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hedef IP Adresi
                    </label>
                    <input
                      type="text"
                      name="targetIp"
                      value={formData.targetIp}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="104.21.0.0"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Netlify IP adresi (varsayılan: 104.21.0.0)
                    </p>
                  </div>
                </div>
              </div>

              {/* DNS Ayarları */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FaServer className="mr-2" />
                  DNS Ayarları
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Otomatik DNS Kurulumu</h3>
                    <p className="text-sm text-blue-700">
                      Subdomain oluşturulduğunda DNS kayıtları otomatik olarak oluşturulur. 
                      DNS propagasyonu genellikle 5-15 dakika sürer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Kolon - İşletme Bilgileri */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FaBuilding className="mr-2" />
                  İşletme Bilgileri
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşletme Adı *
                    </label>
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kardeşler Restoran"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kadıköy, İstanbul"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şehir
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="İstanbul"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İlçe
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Kadıköy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sahip Bilgileri */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FaUser className="mr-2" />
                  Sahip Bilgileri
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sahip Adı *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ahmet Yılmaz"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="info@kardesler.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+90 555 123 4567"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <Link
              href="/admin/subdomains"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isLoading || !subdomainAvailable}
              className={`px-6 py-2 rounded-lg flex items-center ${
                isLoading || !subdomainAvailable
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              {isLoading ? 'Oluşturuluyor...' : 'Subdomain Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


