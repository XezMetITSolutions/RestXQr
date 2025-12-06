'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft,
  FaPaperPlane,
  FaEnvelope,
  FaSms,
  FaBell,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
  FaCheckCircle,
  FaCog,
  FaUser,
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
  FaSave
} from 'react-icons/fa';

export default function CreateNotification() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'info',
    priority: 'medium',
    title: '',
    message: '',
    recipientType: 'all',
    recipientId: '',
    recipientName: '',
    channel: 'email',
    scheduledAt: '',
    immediate: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Demo: Bildirim oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Bildirim oluşturuluyor:', formData);
      alert('Bildirim başarıyla oluşturuldu!');
      router.push('/admin/notifications');
    } catch (error) {
      console.error('Create notification error:', error);
      alert('Bildirim oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'info': return <FaInfoCircle className="text-blue-600" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-600" />;
      case 'error': return <FaTimes className="text-red-600" />;
      case 'success': return <FaCheckCircle className="text-green-600" />;
      case 'system': return <FaCog className="text-gray-600" />;
      default: return <FaInfoCircle className="text-gray-600" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch(channel) {
      case 'email': return <FaEnvelope className="text-blue-600" />;
      case 'sms': return <FaSms className="text-green-600" />;
      case 'push': return <FaBell className="text-orange-600" />;
      case 'in_app': return <FaInfoCircle className="text-purple-600" />;
      default: return <FaEnvelope className="text-gray-600" />;
    }
  };

  const getRecipientIcon = (type: string) => {
    switch(type) {
      case 'all': return <FaUsers className="text-blue-600" />;
      case 'admin': return <FaCog className="text-gray-600" />;
      case 'restaurant': return <FaBuilding className="text-orange-600" />;
      case 'user': return <FaUser className="text-green-600" />;
      default: return <FaUsers className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Bildirim Oluştur</h1>
              <p className="text-gray-600 mt-1">Sistem kullanıcılarına bildirim gönderin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bildirim Türü ve Öncelik */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Türü ve Öncelik</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bildirim Türü</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'info', label: 'Bilgi', icon: 'info' },
                      { value: 'warning', label: 'Uyarı', icon: 'warning' },
                      { value: 'error', label: 'Hata', icon: 'error' },
                      { value: 'success', label: 'Başarı', icon: 'success' },
                      { value: 'system', label: 'Sistem', icon: 'system' }
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex items-center ${
                          formData.type === type.value
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <div className="mr-3">
                          {getTypeIcon(type.icon)}
                        </div>
                        <span className="text-sm font-medium">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bildirim İçeriği */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bildirim İçeriği</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bildirim başlığını girin"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bildirim mesajını girin"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Alıcı Seçimi */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Alıcı Seçimi</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alıcı Türü</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'all', label: 'Tüm Kullanıcılar', icon: 'all' },
                      { value: 'admin', label: 'Adminler', icon: 'admin' },
                      { value: 'restaurant', label: 'İşletmeler', icon: 'restaurant' },
                      { value: 'user', label: 'Kullanıcılar', icon: 'user' }
                    ].map((recipient) => (
                      <label
                        key={recipient.value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex items-center ${
                          formData.recipientType === recipient.value
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="recipientType"
                          value={recipient.value}
                          checked={formData.recipientType === recipient.value}
                          onChange={(e) => handleInputChange('recipientType', e.target.value)}
                          className="sr-only"
                        />
                        <div className="mr-3">
                          {getRecipientIcon(recipient.icon)}
                        </div>
                        <span className="text-sm font-medium">{recipient.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.recipientType !== 'all' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alıcı ID</label>
                      <input
                        type="text"
                        value={formData.recipientId}
                        onChange={(e) => handleInputChange('recipientId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Alıcı ID'sini girin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alıcı Adı</label>
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => handleInputChange('recipientName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Alıcı adını girin"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gönderim Ayarları */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gönderim Ayarları</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gönderim Kanalı</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'email', label: 'Email', icon: 'email' },
                      { value: 'sms', label: 'SMS', icon: 'sms' },
                      { value: 'push', label: 'Push', icon: 'push' },
                      { value: 'in_app', label: 'Uygulama İçi', icon: 'in_app' }
                    ].map((channel) => (
                      <label
                        key={channel.value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex items-center ${
                          formData.channel === channel.value
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="channel"
                          value={channel.value}
                          checked={formData.channel === channel.value}
                          onChange={(e) => handleInputChange('channel', e.target.value)}
                          className="sr-only"
                        />
                        <div className="mr-3">
                          {getChannelIcon(channel.icon)}
                        </div>
                        <span className="text-sm font-medium">{channel.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.immediate}
                      onChange={(e) => {
                        handleInputChange('immediate', e.target.checked.toString());
                        if (e.target.checked) {
                          handleInputChange('scheduledAt', '');
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Hemen gönder</span>
                  </label>
                </div>

                {!formData.immediate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zamanlanmış Gönderim</label>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Önizleme */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Önizleme</h2>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {getTypeIcon(formData.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
                        {formData.type === 'info' ? 'Bilgi' :
                         formData.type === 'warning' ? 'Uyarı' :
                         formData.type === 'error' ? 'Hata' :
                         formData.type === 'success' ? 'Başarı' : 'Sistem'}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-800">
                        {formData.priority === 'low' ? 'Düşük' :
                         formData.priority === 'medium' ? 'Orta' :
                         formData.priority === 'high' ? 'Yüksek' : 'Acil'}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {formData.title || 'Bildirim başlığı'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.message || 'Bildirim mesajı burada görünecek...'}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {getChannelIcon(formData.channel)} {formData.channel} • 
                      {formData.recipientType === 'all' ? ' Tüm Kullanıcılar' : ` ${formData.recipientName || 'Alıcı'}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaPaperPlane className="mr-2" />
                )}
                {isLoading ? 'Oluşturuluyor...' : 'Bildirim Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
