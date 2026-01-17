'use client';

import { useEffect, useMemo, useState } from 'react';

type PermissionSet = {
  kitchen?: any[];
  waiter?: any[];
  cashier?: any[];
};

type DebugStatus = {
  ok: boolean;
  status: number;
  body: any;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

export default function StaffPermissionsDebugPage() {
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<DebugStatus | null>(null);
  const [apiRoleStatus, setApiRoleStatus] = useState<DebugStatus | null>(null);
  const [localPermissions, setLocalPermissions] = useState<PermissionSet | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const authToken = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const staffToken = localStorage.getItem('staff_token');
    if (staffToken) return staffToken;
    const businessToken = localStorage.getItem('business_token');
    if (businessToken) return businessToken;
    return null;
  }, []);

  const cacheKey = useMemo(() => {
    if (!restaurantId) return '';
    return `permissions_${restaurantId}`;
  }, [restaurantId]);

  const addLog = (message: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()} • ${message}`, ...prev.slice(0, 29)]);
  };

  const loadLocalStorage = () => {
    if (typeof window === 'undefined') return;
    const restaurantRaw = localStorage.getItem('currentRestaurant');
    if (restaurantRaw) {
      try {
        const parsed = JSON.parse(restaurantRaw);
        setRestaurantId(parsed?.id || '');
        setRestaurantName(parsed?.name || '');
      } catch {
        addLog('❌ currentRestaurant JSON parse failed');
      }
    }

    if (cacheKey) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setLocalPermissions(JSON.parse(cached));
          addLog(`✅ Local cache loaded (${cacheKey})`);
        } catch {
          addLog('❌ permissions cache JSON parse failed');
        }
      } else {
        setLocalPermissions(null);
        addLog(`⚠️ Local cache not found (${cacheKey})`);
      }
    }
  };

  const refreshApi = async () => {
    if (!restaurantId) {
      addLog('❌ Restaurant ID not found in localStorage');
      return;
    }

    setLoading(true);
    try {
      addLog('🔄 Fetching permissions from API...');
      const response = await fetch(`${API_BASE}/permissions/${restaurantId}`, {
        headers: {
          'Authorization': authToken ? (authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`) : '',
          'Content-Type': 'application/json',
          'X-Subdomain': typeof window !== 'undefined' ? window.location.hostname.split('.')[0] || 'kroren' : 'kroren'
        }
      });
      const body = await response.json();
      setApiStatus({ ok: response.ok, status: response.status, body });
      addLog(response.ok ? '✅ API /permissions success' : `❌ API /permissions failed (${response.status})`);

      const roleResponse = await fetch(`${API_BASE}/permissions/${restaurantId}/kitchen`, {
        headers: {
          'Authorization': authToken ? (authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`) : '',
          'Content-Type': 'application/json',
          'X-Subdomain': typeof window !== 'undefined' ? window.location.hostname.split('.')[0] || 'kroren' : 'kroren'
        }
      });
      const roleBody = await roleResponse.json();
      setApiRoleStatus({ ok: roleResponse.ok, status: roleResponse.status, body: roleBody });
      addLog(roleResponse.ok ? '✅ API /permissions/kitchen success' : `❌ API /permissions/kitchen failed (${roleResponse.status})`);
    } catch (error: any) {
      addLog(`❌ API error: ${error?.message || 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const tokenPreview = authToken ? `${authToken.substring(0, 30)}...` : 'NOT FOUND';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h1 className="text-2xl font-semibold">Staff Permissions Debug</h1>
          <p className="text-sm text-slate-400 mt-1">
            Toggle değişikliklerinin nereye kaydedildiğini ve API’nin hangi veriyi döndürdüğünü kontrol eder.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">Session & Token</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div>Restaurant ID: <span className="text-emerald-400">{restaurantId || 'NOT FOUND'}</span></div>
              <div>Restaurant Name: <span className="text-emerald-400">{restaurantName || 'NOT FOUND'}</span></div>
              <div>Auth Token: <span className="text-amber-300">{tokenPreview}</span></div>
              <div>Cache Key: <span className="text-slate-300">{cacheKey || 'N/A'}</span></div>
            </div>
            <button
              onClick={loadLocalStorage}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
            >
              LocalStorage Yenile
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">API Kontrol</h2>
            <div className="mt-3 text-sm text-slate-300">
              <div>Endpoint: {API_BASE}/permissions/:restaurantId</div>
              <div>Endpoint: {API_BASE}/permissions/:restaurantId/kitchen</div>
            </div>
            <button
              onClick={refreshApi}
              disabled={loading}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm disabled:opacity-60"
            >
              {loading ? 'Kontrol Ediliyor...' : 'API Test Et'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold">Local Cache (permissions_*)</h2>
          <pre className="mt-3 text-xs text-slate-200 bg-slate-950 rounded-xl p-4 overflow-auto">
{localPermissions ? JSON.stringify(localPermissions, null, 2) : 'No local permissions cache found.'}
          </pre>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">API Response (All)</h2>
            <pre className="mt-3 text-xs text-slate-200 bg-slate-950 rounded-xl p-4 overflow-auto">
{apiStatus ? JSON.stringify(apiStatus, null, 2) : 'Henüz API çağrısı yapılmadı.'}
            </pre>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">API Response (Kitchen)</h2>
            <pre className="mt-3 text-xs text-slate-200 bg-slate-950 rounded-xl p-4 overflow-auto">
{apiRoleStatus ? JSON.stringify(apiRoleStatus, null, 2) : 'Henüz API çağrısı yapılmadı.'}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold">Log</h2>
          <div className="mt-3 max-h-64 overflow-auto text-xs space-y-1 text-slate-300">
            {logs.length === 0 ? 'Log yok.' : logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
          <div className="font-semibold">Nasıl kullanılır?</div>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Toggle değiştirip kaydedin, sonra bu sayfada Local Cache bölümünü kontrol edin.</li>
            <li>API Test Et düğmesi ile backend’in veri döndürüp döndürmediğini görün.</li>
            <li>Local Cache varsa ama API boşsa, backend kalıcı kayıt yapmıyor demektir.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
