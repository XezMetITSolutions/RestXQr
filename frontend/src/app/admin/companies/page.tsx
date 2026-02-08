'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  FaBuilding,
  FaPlus,
  FaUtensils,
  FaUserPlus,
  FaTimes,
  FaCheck,
  FaTrash
} from 'react-icons/fa';

interface Company {
  id: string;
  name: string;
  description?: string;
  restaurantCount: number;
  restaurants: { id: string; name: string; username: string }[];
}

interface RestaurantOption {
  id: string;
  name: string;
  username: string;
}

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<RestaurantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDesc, setNewCompanyDesc] = useState('');
  const [assignModal, setAssignModal] = useState<{ companyId: string; companyName: string } | null>(null);
  const [selectedRestIds, setSelectedRestIds] = useState<string[]>([]);
  const [adminModal, setAdminModal] = useState<{ companyId: string; companyName: string } | null>(null);
  const [adminForm, setAdminForm] = useState({ username: '', email: '', name: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<{ text: string; loginUrl: string; username: string } | null>(null);

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
  const API_URL = (rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`)
    .replace(/\/+$/, '')
    .concat(rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/') ? '' : '/api');

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('admin_access_token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    const user = localStorage.getItem('admin_user');
    if (user) {
      try {
        const u = JSON.parse(user);
        if (u.role !== 'super_admin') {
          router.replace('/admin/dashboard');
          return;
        }
      } catch (_) { }
    }
    fetchCompanies();
    fetchAllRestaurants();
  }, [router]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/companies`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (res.status === 403) {
        router.replace('/admin/dashboard');
        return;
      }
      const data = await res.json();
      if (data.success && data.data) setCompanies(data.data);
    } catch (e) {
      console.error(e);
      setError('Şirketler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRestaurants = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard/restaurants`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data) setAllRestaurants(data.data.map((r: { id: string; name: string; username: string }) => ({ id: r.id, name: r.name, username: r.username })));
    } catch (_) { }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/companies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newCompanyName.trim(), description: newCompanyDesc.trim() || null })
      });
      const data = await res.json();
      if (data.success) {
        setNewCompanyName('');
        setNewCompanyDesc('');
        setShowAddCompany(false);
        await fetchCompanies();
      } else {
        setError(data.message || 'Oluşturulamadı');
      }
    } catch (e) {
      setError('İstek başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignRestaurants = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal || selectedRestIds.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/companies/${assignModal.companyId}/restaurants`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ restaurantIds: selectedRestIds })
      });
      const data = await res.json();
      if (data.success) {
        setAssignModal(null);
        setSelectedRestIds([]);
        await fetchCompanies();
      } else {
        setError(data.message || 'Atama başarısız');
      }
    } catch (e) {
      setError('İstek başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCompanyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminModal || !adminForm.username || !adminForm.email || !adminForm.name || !adminForm.password) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/companies/${adminModal.companyId}/admins`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminForm)
      });
      const data = await res.json();
      if (data.success) {
        const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/companies/login` : '/companies/login';
        setSuccessMessage({
          text: 'Şirket yöneticisi oluşturuldu. Bu hesap ile şirket giriş sayfasından giriş yapmalıdır (süper admin girişi ile aynı yer değil).',
          loginUrl,
          username: adminForm.username
        });
        setAdminModal(null);
        setAdminForm({ username: '', email: '', name: '', password: '' });
      } else {
        setError(data.message || 'Oluşturulamadı');
      }
    } catch (e) {
      setError('İstek başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (companyId: string, restaurantId: string) => {
    if (!confirm('Bu restoranı şirketten çıkarmak istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/companies/${companyId}/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) await fetchCompanies();
    } catch (_) { }
  };

  return (
    <AdminLayout title="Çoklu Restoran / Grup Yönetimi (Restoran Atama)" description="Aynı şirkete ait restoranları gruplayın; şirket hesabıyla giriş yapan tüm şubeleri görsün">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <FaTimes />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
          <p className="font-medium mb-2">{successMessage.text}</p>
          <p className="text-sm mb-2">
            <strong>Giriş adresi:</strong>{' '}
            <a href={successMessage.loginUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
              {successMessage.loginUrl}
            </a>
          </p>
          <p className="text-sm">
            <strong>Kullanıcı adı:</strong> {successMessage.username} — Belirlediğiniz şifre ile giriş yapın.
          </p>
          <button type="button" onClick={() => setSuccessMessage(null)} className="mt-2 text-green-600 hover:text-green-800 text-sm">
            Kapat
          </button>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Şirket oluşturup restoranları atayın. Şirket yöneticisi (company_admin) hesabı açarak o hesaba giriş yapan kullanıcı sadece o şirketin restoranlarını görür.
        </p>
        <button
          type="button"
          onClick={() => setShowAddCompany(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <FaPlus /> Yeni Şirket
        </button>
      </div>

      {showAddCompany && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yeni şirket</h3>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şirket adı *</label>
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: ABC Restoran Grubu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama (isteğe bağlı)</label>
              <input
                type="text"
                value={newCompanyDesc}
                onChange={(e) => setNewCompanyDesc(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Kısa açıklama"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Kaydediliyor...' : 'Oluştur'}
              </button>
              <button type="button" onClick={() => { setShowAddCompany(false); setNewCompanyName(''); setNewCompanyDesc(''); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">Yükleniyor...</div>
      ) : (
        <div className="space-y-6">
          {companies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-500">
              Henüz şirket yok. &quot;Yeni Şirket&quot; ile ekleyin.
            </div>
          ) : (
            companies.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <FaBuilding className="text-indigo-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
                      {c.description && <p className="text-sm text-gray-500">{c.description}</p>}
                      <p className="text-sm text-gray-600 mt-1">
                        <FaUtensils className="inline mr-1" /> {c.restaurantCount} restoran
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignModal({ companyId: c.id, companyName: c.name })}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <FaPlus /> Restoran Ata
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminModal({ companyId: c.id, companyName: c.name })}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                    >
                      <FaUserPlus /> Şirket Yöneticisi Ekle
                    </button>
                  </div>
                </div>
                {c.restaurants && c.restaurants.length > 0 && (
                  <div className="p-4 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Bu şirkete ait restoranlar</p>
                    <ul className="space-y-2">
                      {c.restaurants.map((r) => (
                        <li key={r.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100">
                          <span className="font-medium text-gray-800">{r.name}</span>
                          <span className="text-sm text-gray-500">{r.username}</span>
                          <button
                            type="button"
                            onClick={() => handleUnassign(c.id, r.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Şirketten çıkar"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Restoran atama modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Restoran ata: {assignModal.companyName}</h3>
              <button type="button" onClick={() => { setAssignModal(null); setSelectedRestIds([]); }} className="p-2 text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAssignRestaurants} className="flex flex-col flex-1 min-h-0">
              <div className="p-4 overflow-y-auto flex-1">
                <p className="text-sm text-gray-600 mb-3">Bu şirkete eklemek istediğiniz restoranları seçin (çoklu seçim).</p>
                <div className="space-y-2">
                  {allRestaurants.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRestIds.includes(r.id)}
                        onChange={(e) => setSelectedRestIds((prev) => (e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id)))}
                      />
                      <span className="font-medium">{r.name}</span>
                      <span className="text-gray-500 text-sm">@{r.username}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button type="button" onClick={() => { setAssignModal(null); setSelectedRestIds([]); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" disabled={submitting || selectedRestIds.length === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? 'Atanıyor...' : 'Ata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Şirket yöneticisi ekle modal */}
      {adminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Şirket yöneticisi: {adminModal.companyName}</h3>
              <button type="button" onClick={() => { setAdminModal(null); setAdminForm({ username: '', email: '', name: '', password: '' }); }} className="p-2 text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateCompanyAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı adı *</label>
                <input
                  type="text"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
                <button type="button" onClick={() => { setAdminModal(null); setAdminForm({ username: '', email: '', name: '', password: '' }); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
