'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaBell, 
  FaSearch, 
  FaFilter, 
  FaEye,
  FaCheck,
  FaTimes,
  FaTrash,
  FaEdit, 
  FaPaperPlane,
  FaEnvelope,
  FaSms,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaBuilding,
  FaCreditCard,
  FaDownload,
  FaSync,
  FaPlus,
  FaCog
} from 'react-icons/fa';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  recipient: {
    type: 'all' | 'restaurant' | 'user' | 'admin';
    id?: string;
    name?: string;
  };
  channel: 'email' | 'sms' | 'push' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduledAt?: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
  createdBy: string;
  metadata?: {
    restaurantId?: string;
    userId?: string;
    actionUrl?: string;
    data?: any;
  };
}

export default function NotificationsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const notifications: Notification[] = [
    // Demo veriler temizlendi - boş başlangıç
  ];

  const getTypeClass = (type: string) => {
    switch(type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch(type) {
      case 'info': return 'Bilgi';
      case 'warning': return 'Uyarı';
      case 'error': return 'Hata';
      case 'success': return 'Başarı';
      case 'system': return 'Sistem';
      default: return type;
    }
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

  const getPriorityClass = (priority: string) => {
    switch(priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch(priority) {
      case 'low': return 'Düşük';
      case 'medium': return 'Orta';
      case 'high': return 'Yüksek';
      case 'urgent': return 'Acil';
      default: return priority;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Beklemede';
      case 'sent': return 'Gönderildi';
      case 'delivered': return 'Teslim Edildi';
      case 'failed': return 'Başarısız';
      case 'read': return 'Okundu';
      default: return status;
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

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.recipient.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const handleBulkAction = async (action: string) => {
    if (selectedNotifications.length === 0) {
      alert('Lütfen işlem yapmak istediğiniz bildirimleri seçin');
      return;
    }

    setIsLoading(true);
    try {
      // Demo: Toplu işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`${action} işlemi:`, selectedNotifications);
      alert(`${selectedNotifications.length} bildirim için ${action} işlemi tamamlandı`);
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationAction = async (notificationId: string, action: string) => {
    setIsLoading(true);
    try {
      // Demo: Tekil işlem simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`${action} işlemi:`, notificationId);
      alert(`${action} işlemi tamamlandı`);
    } catch (error) {
      console.error('Notification action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Bildirim Yönetimi" description="Sistem bildirimlerini yönetin">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bildirim Yönetimi</h1>
              <p className="text-gray-600 mt-1">Sistem bildirimlerini görüntüle ve yönet</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center"
              >
              <FaPlus className="mr-2" />
              Yeni Bildirim
            </button>
            <button
                onClick={() => handleBulkAction('markRead')}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaCheck className="mr-2" />
                Okundu İşaretle
            </button>
            <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaTrash className="mr-2" />
                Sil
            </button>
            <button
                onClick={() => window.location.reload()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaSync className="mr-2" />
                Yenile
            </button>
        </div>
      </div>
                </div>
              </div>
              
      {/* Filters and Search */}
        <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                  placeholder="Başlık, mesaj veya alıcı..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tür</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Türler</option>
                <option value="info">Bilgi</option>
                <option value="warning">Uyarı</option>
                <option value="error">Hata</option>
                <option value="success">Başarı</option>
                <option value="system">Sistem</option>
              </select>
            </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                  <option value="sent">Gönderildi</option>
                <option value="delivered">Teslim Edildi</option>
                  <option value="failed">Başarısız</option>
                <option value="read">Okundu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Öncelikler</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center">
                  <FaFilter className="mr-2" />
                  Filtrele
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Statistics */}
      <div className="px-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FaBell className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Bildirim</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Beklemede</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.filter(n => n.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Teslim Edildi</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.filter(n => n.status === 'delivered').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <FaTimes className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Başarısız</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.filter(n => n.status === 'failed').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <FaExclamationTriangle className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Acil</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.filter(n => n.priority === 'urgent').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="px-8 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-700 font-medium">
                  {selectedNotifications.length} bildirim seçildi
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleBulkAction('markRead')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Okundu İşaretle
                </button>
                <button 
                  onClick={() => handleBulkAction('resend')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Yeniden Gönder
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Sil
                </button>
                <button 
                  onClick={() => setSelectedNotifications([])}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Table */}
      <div className="px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications(filteredNotifications.map(n => n.id));
                        } else {
                          setSelectedNotifications([]);
                        }
                      }}
                    />
                  </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bildirim</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alıcı</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kanal</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotifications([...selectedNotifications, notification.id]);
                          } else {
                            setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                          }
                        }}
                      />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeClass(notification.type)}`}>
                          {getTypeText(notification.type)}
                        </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityClass(notification.priority)}`}>
                            {getPriorityText(notification.priority)}
                          </span>
                        </div>
                          <div className="mt-1">
                            <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{notification.message}</div>
                          </div>
                            </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          {notification.recipient.type === 'admin' ? <FaCog className="text-gray-600" /> :
                           notification.recipient.type === 'restaurant' ? <FaBuilding className="text-gray-600" /> :
                           notification.recipient.type === 'user' ? <FaUser className="text-gray-600" /> :
                           <FaBell className="text-gray-600" />}
                          </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{notification.recipient.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{notification.recipient.type}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                        {getChannelIcon(notification.channel)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{notification.channel}</span>
                          </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusClass(notification.status)}`}>
                        {getStatusText(notification.status)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                      <div className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleTimeString('tr-TR')}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          title="Detayları Görüntüle"
                          onClick={() => handleNotificationAction(notification.id, 'view')}
                        >
                            <FaEye className="text-sm" />
                          </button>
                        {notification.status === 'pending' && (
                          <button 
                            className="text-green-600 hover:text-green-800"
                            title="Gönder"
                            onClick={() => handleNotificationAction(notification.id, 'send')}
                          >
                            <FaPaperPlane className="text-sm" />
                          </button>
                        )}
                        <button 
                          className="text-gray-600 hover:text-gray-800"
                          title="Düzenle"
                          onClick={() => handleNotificationAction(notification.id, 'edit')}
                        >
                            <FaEdit className="text-sm" />
                          </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          title="Sil"
                          onClick={() => handleNotificationAction(notification.id, 'delete')}
                        >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
