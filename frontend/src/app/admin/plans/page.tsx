'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FaEdit, FaPlus, FaCheck, FaTimes, FaSave, FaQrcode, FaUsers, FaUtensils, FaCog } from 'react-icons/fa';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  maxTables: number;
  maxMenuItems: number;
  maxStaff: number;
  features: string[];
  isActive: boolean;
}

export default function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 'basic',
      name: 'basic',
      displayName: 'Basic',
      price: 2980,
      maxTables: 10,
      maxMenuItems: 50,
      maxStaff: 3,
      features: [
        'QR Menü Sistemi',
        'Mutfak Paneli (2 kullanıcı)',
        'Garson Paneli (2 kullanıcı)',
        'İşletme Paneli (1 kullanıcı)',
        'Temel Raporlar',
        'WhatsApp Destek'
      ],
      isActive: true
    },
    {
      id: 'premium',
      name: 'premium',
      displayName: 'Premium',
      price: 4980,
      maxTables: 25,
      maxMenuItems: 150,
      maxStaff: 10,
      features: [
        'QR Menü Sistemi (Sınırsız)',
        'Mutfak Paneli (5 kullanıcı)',
        'Garson Paneli (3 kullanıcı)',
        'İşletme Paneli (2 kullanıcı)',
        '7/24 WhatsApp Destek',
        'Google Yorum Entegrasyonu',
        'Detaylı Satış Raporları',
        'Stok Yönetimi'
      ],
      isActive: true
    },
    {
      id: 'enterprise',
      name: 'enterprise',
      displayName: 'Enterprise',
      price: 9980,
      maxTables: 999,
      maxMenuItems: 999,
      maxStaff: 999,
      features: [
        'Premium\'in Tüm Özellikleri',
        'Sınırsız Kullanıcı',
        'Çoklu Şube Yönetimi',
        'API Entegrasyonları',
        'Özel Tema Tasarımı',
        'Özel Eğitim',
        'Dedicated Account Manager',
        '7/24 Telefon Desteği'
      ],
      isActive: true
    }
  ]);

  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Plan>>({});

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditValues(plan);
  };

  const handleSave = async (planId: string) => {
    try {
      // Backend'e plan güncellemesini gönder
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maxTables: editValues.maxTables,
          maxMenuItems: editValues.maxMenuItems,
          maxStaff: editValues.maxStaff,
          price: editValues.price
        })
      });

      const result = await response.json();

      if (result.success) {
        // Frontend state'i güncelle
        setPlans(plans.map(p => 
          p.id === planId ? { ...p, ...editValues } : p
        ));
        setEditingPlan(null);
        setEditValues({});
        
        // Başarı mesajı
        alert(`✅ Plan başarıyla güncellendi!\n\n${result.updatedRestaurants || 0} restoran etkilendi.`);
      } else {
        alert(`❌ Hata: ${result.message}`);
      }
    } catch (error) {
      console.error('Plan güncelleme hatası:', error);
      alert('❌ Plan güncellenirken bir hata oluştu!');
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditValues({});
  };

  const handleToggleActive = (planId: string) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  return (
    <AdminLayout title="Plan Yönetimi">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Plan Yönetimi</h1>
        <p className="text-gray-600 mt-1">Abonelik paketlerini yönetin ve düzenleyin</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
              !plan.isActive ? 'opacity-50 border-gray-300' : 'border-purple-200'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingPlan === plan.id ? (
                    <input
                      type="text"
                      value={editValues.displayName || ''}
                      onChange={(e) => setEditValues({ ...editValues, displayName: e.target.value })}
                      className="border rounded px-2 py-1 text-xl"
                    />
                  ) : (
                    plan.displayName
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Plan ID: {plan.name}</p>
              </div>
              <div className="flex gap-2">
                {editingPlan === plan.id ? (
                  <>
                    <button
                      onClick={() => handleSave(plan.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      title="Kaydet"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      title="İptal"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                    title="Düzenle"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-purple-600">
                {editingPlan === plan.id ? (
                  <input
                    type="number"
                    value={editValues.price || ''}
                    onChange={(e) => setEditValues({ ...editValues, price: parseInt(e.target.value) })}
                    className="border rounded px-2 py-1 w-32"
                  />
                ) : (
                  `₺${plan.price.toLocaleString('tr-TR')}`
                )}
              </div>
              <p className="text-sm text-gray-500">/aylık</p>
            </div>

            {/* Limits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaQrcode className="text-blue-600" />
                  <span className="text-sm font-medium">Maksimum Masa</span>
                </div>
                {editingPlan === plan.id ? (
                  <input
                    type="number"
                    value={editValues.maxTables || ''}
                    onChange={(e) => setEditValues({ ...editValues, maxTables: parseInt(e.target.value) })}
                    className="border rounded px-2 py-1 w-20 text-right"
                  />
                ) : (
                  <span className="font-bold text-blue-600">{plan.maxTables === 999 ? '∞' : plan.maxTables}</span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaUtensils className="text-green-600" />
                  <span className="text-sm font-medium">Maksimum Menü</span>
                </div>
                {editingPlan === plan.id ? (
                  <input
                    type="number"
                    value={editValues.maxMenuItems || ''}
                    onChange={(e) => setEditValues({ ...editValues, maxMenuItems: parseInt(e.target.value) })}
                    className="border rounded px-2 py-1 w-20 text-right"
                  />
                ) : (
                  <span className="font-bold text-green-600">{plan.maxMenuItems === 999 ? '∞' : plan.maxMenuItems}</span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-orange-600" />
                  <span className="text-sm font-medium">Maksimum Personel</span>
                </div>
                {editingPlan === plan.id ? (
                  <input
                    type="number"
                    value={editValues.maxStaff || ''}
                    onChange={(e) => setEditValues({ ...editValues, maxStaff: parseInt(e.target.value) })}
                    className="border rounded px-2 py-1 w-20 text-right"
                  />
                ) : (
                  <span className="font-bold text-orange-600">{plan.maxStaff === 999 ? '∞' : plan.maxStaff}</span>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Özellikler</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm font-medium text-gray-700">Plan Durumu</span>
              <button
                onClick={() => handleToggleActive(plan.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  plan.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    plan.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaCog className="text-blue-600 text-xl mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Plan Limitleri Hakkında</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Maksimum Masa:</strong> Restoran bu sayıdan fazla QR kod oluşturamaz</li>
              <li>• <strong>Maksimum Menü:</strong> Bu sayıdan fazla ürün eklenemez</li>
              <li>• <strong>Maksimum Personel:</strong> Bu sayıdan fazla personel eklenemez</li>
              <li>• <strong>999 değeri:</strong> Sınırsız anlamına gelir (∞)</li>
              <li>• Pasif planlar yeni aboneliklerde görünmez</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
