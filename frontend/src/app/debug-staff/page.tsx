'use client';

import { useEffect, useState } from 'react';

type Restaurant = { id: string; name: string; username: string; email?: string };
type Staff = { id: string; name: string; email: string; username: string; role: string; restaurantId: string };

export default function DebugStaffPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [hazalRestaurant, setHazalRestaurant] = useState<Restaurant | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Hazal restoranı için önceden dolu form
  const [form, setForm] = useState({
    name: 'Hazal Kasa',
    email: 'kasa@hazal.com',
    username: 'hazal_kasa',
    password: '123456',
    role: 'cashier',
    phone: '5551234567'
  });

  // Restoranları getir ve Hazal'ı bul
  useEffect(() => {
    (async () => {
      try {
        console.log('📡 Fetching restaurants...');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/restaurants`);
        const data = await res.json();
        console.log('📊 Restaurants response:', data);
        setRestaurants(data?.data || []);

        // Hazal restoranını bul
        const hazal = data?.data?.find((r: Restaurant) => r.username === 'hazal');
        if (hazal) {
          setHazalRestaurant(hazal);
          console.log('✅ Hazal restaurant found:', hazal);
        } else {
          console.log('❌ Hazal restaurant not found');
        }
      } catch (e) {
        console.error('❌ Restaurant fetch error:', e);
        setResult({ success: false, message: 'Restaurant fetch failed', error: e });
      }
    })();
  }, []);

  // Hazal restoranı için staff listesini getir
  const loadHazalStaff = async () => {
    if (!hazalRestaurant?.id) return;
    
    try {
      console.log('📡 Loading staff for Hazal restaurant:', hazalRestaurant.id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/restaurant/${hazalRestaurant.id}`);
      const data = await res.json();
      console.log('📊 Staff response:', data);
      setStaff(data?.data || []);
    } catch (e) {
      console.error('❌ Staff fetch error:', e);
      setResult({ success: false, message: 'Staff fetch failed', error: e });
    }
  };

  // Hazal restoranı bulunduğunda staff'ı yükle
  useEffect(() => {
    if (hazalRestaurant) {
      loadHazalStaff();
    }
  }, [hazalRestaurant]);

  // Restaurant restore
  const restoreRestaurants = async () => {
    setLoading(true);
    setResult(null);
    try {
      console.log('🔄 Restoring restaurants...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/restore-restaurants`, {
        method: 'POST'
      });
      const data = await response.json();
      console.log('📊 Restore response:', data);
      setResult(data);
      
      // Sayfayı yenile
      window.location.reload();
    } catch (e: any) {
      console.error('❌ Restore error:', e);
      setResult({ success: false, message: e?.message || 'Restore failed' });
    } finally {
      setLoading(false);
    }
  };

  // Hazal için staff ekle
  const createHazalStaff = async () => {
    if (!hazalRestaurant?.id) {
      alert('Hazal restoranı bulunamadı! Önce restaurant restore yapın.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      console.log('📡 Creating staff for Hazal...', { restaurantId: hazalRestaurant.id, ...form });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/restaurant/${hazalRestaurant.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          username: form.username.trim(),
          password: form.password,
          role: form.role,
          phone: form.phone.trim() || undefined
        })
      });
      const data = await response.json();
      console.log('📊 Create staff response:', data);
      setResult(data);
      
      // Staff listesini yeniden yükle
      await loadHazalStaff();
    } catch (e: any) {
      console.error('❌ Create staff error:', e);
      setResult({ success: false, message: e?.message || 'Create staff failed' });
    } finally {
      setLoading(false);
    }
  };

  // Staff sil
  const deleteStaff = async (staffId: string) => {
    if (!confirm('Bu personeli silmek istediğinizden emin misiniz?')) return;
    
    setLoading(true);
    setResult(null);
    try {
      console.log('🗑️ Deleting staff:', staffId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/${staffId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      console.log('📊 Delete staff response:', data);
      setResult(data);
      
      // Staff listesini yeniden yükle
      await loadHazalStaff();
    } catch (e: any) {
      console.error('❌ Delete staff error:', e);
      setResult({ success: false, message: e?.message || 'Delete staff failed' });
    } finally {
      setLoading(false);
    }
  };

  // Staff login test
  const testStaffLogin = async (username: string, password: string) => {
    setLoading(true);
    setResult(null);
    try {
      console.log('🔐 Testing staff login...', { username, password, subdomain: 'hazal' });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          subdomain: 'hazal'
        })
      });
      const data = await response.json();
      console.log('📊 Login response:', data);
      setResult(data);
    } catch (e: any) {
      console.error('❌ Login error:', e);
      setResult({ success: false, message: e?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  // Panel test fonksiyonları
  const testPanelAccess = (role: string) => {
    const panelUrls = {
      waiter: 'https://hazal.guzellestir.com/waiter/',
      cashier: 'https://hazal.guzellestir.com/cashier/',
      chef: 'https://hazal.guzellestir.com/kitchen/',
      manager: 'https://hazal.guzellestir.com/business/'
    };
    
    const url = panelUrls[role as keyof typeof panelUrls];
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔧 Hazal Restaurant Debug</h1>

        {/* Restaurant Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🏪 Restaurant Durumu</h2>
          {hazalRestaurant ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800">✅ Hazal Restaurant Bulundu</h3>
              <p className="text-sm text-green-600">
                ID: {hazalRestaurant.id}<br/>
                Ad: {hazalRestaurant.name}<br/>
                Username: {hazalRestaurant.username}<br/>
                Email: {hazalRestaurant.email}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800">❌ Hazal Restaurant Bulunamadı</h3>
              <p className="text-sm text-red-600">Restaurant restore yapmanız gerekiyor.</p>
            </div>
          )}
          <button
            onClick={restoreRestaurants}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Restoring...' : 'Restore Restaurants'}
          </button>
        </div>

        {/* Staff Creation for Hazal */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Hazal için Staff Ekleme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ad Soyad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="mail@ornek.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="kullanici_adi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="waiter">Garson</option>
                <option value="cashier">Kasiyer</option>
                <option value="chef">Aşçı</option>
                <option value="manager">Yönetici</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="5xx xxx xx xx"
              />
            </div>
          </div>
          <button
            onClick={createHazalStaff}
            disabled={loading || !hazalRestaurant}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Hazal için Staff Oluştur'}
          </button>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👥 Hazal Staff Listesi ({staff.length})</h2>
          {staff.length === 0 ? (
            <p className="text-gray-500">Henüz staff bulunmuyor</p>
          ) : (
            <div className="space-y-3">
              {staff.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-600">
                      {s.email} • {s.username} • {s.role}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => testStaffLogin(s.username, '123456')}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Login Test
                    </button>
                    <button
                      onClick={() => testPanelAccess(s.role)}
                      className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                    >
                      Panel Test
                    </button>
                    <button
                      onClick={() => deleteStaff(s.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Panel Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => testPanelAccess('cashier')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              💰 Kasa Paneli
            </button>
            <button
              onClick={() => testPanelAccess('chef')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              👨‍🍳 Mutfak Paneli
            </button>
            <button
              onClick={() => testPanelAccess('waiter')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🍽️ Garson Paneli
            </button>
            <button
              onClick={() => testPanelAccess('manager')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              🏢 Yönetim Paneli
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Sonuç</h2>
            <div className={`p-4 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <pre className="text-sm whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
