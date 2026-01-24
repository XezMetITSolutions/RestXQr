'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

type StepResult = {
  name: string;
  ok: boolean;
  status?: number;
  ms?: number;
  details?: any;
  error?: any;
};

function safeStringify(v: any) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export default function QRCodesDebugPage() {
  const router = useRouter();
  const auth = useAuthStore();
  const restaurantId = auth.authenticatedRestaurant?.id;
  const settingsStore = useRestaurantSettings(restaurantId);

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<StepResult[]>([]);
  const [imageChecks, setImageChecks] = useState<Array<{ url: string; ok: boolean; error?: string }>>([]);

  const apiBase = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  }, []);

  useEffect(() => {
    auth.initializeAuth();
  }, [auth]);

  const addResult = (r: StepResult) => {
    setResults((prev) => [...prev, r]);
  };

  const time = async <T,>(name: string, fn: () => Promise<T>) => {
    const start = performance.now();
    try {
      const data = await fn();
      addResult({ name, ok: true, ms: Math.round(performance.now() - start), details: data });
      return { ok: true as const, data };
    } catch (e: any) {
      addResult({ name, ok: false, ms: Math.round(performance.now() - start), error: e?.message || String(e) });
      return { ok: false as const, error: e };
    }
  };

  const checkImages = async (urls: string[]) => {
    const checks: Array<{ url: string; ok: boolean; error?: string }> = [];
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'GET' });
        checks.push({ url, ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` });
      } catch (e: any) {
        checks.push({ url, ok: false, error: e?.message || String(e) });
      }
    }
    setImageChecks(checks);
  };

  const runAll = async () => {
    setRunning(true);
    setResults([]);
    setImageChecks([]);

    try {
      addResult({ name: 'Auth summary', ok: true, details: {
        isAuthenticated: auth.isAuthenticated(),
        role: auth.getRole(),
        restaurant: auth.authenticatedRestaurant,
        staff: auth.authenticatedStaff,
        user: auth.user
      }});

      await time('GET /api/settings (via apiService.getSettings)', async () => apiService.getSettings());

      if (!restaurantId) {
        addResult({ name: 'RestaurantId check', ok: false, error: 'No authenticatedRestaurant.id found' });
        return;
      }

      const menu = await time('GET menu (apiService.getRestaurantMenu)', async () => apiService.getRestaurantMenu(restaurantId));
      const qrs = await time('GET qr tokens (apiService.getRestaurantQRTokens)', async () => apiService.getRestaurantQRTokens(restaurantId));

      addResult({ name: 'Settings store snapshot', ok: true, details: { settings: settingsStore.settings } });

      const qrData = (qrs.ok ? (qrs.data as any) : null);
      const list = Array.isArray(qrData?.data) ? qrData.data : (Array.isArray(qrData) ? qrData : []);

      const firstImages = list
        .slice(0, 5)
        .map((t: any) => {
          const url = t?.qrUrl || '';
          return url ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}` : '';
        })
        .filter(Boolean);

      if (firstImages.length > 0) {
        await time('Image fetch test (first 5 QR images)', async () => {
          await checkImages(firstImages);
          return { count: firstImages.length };
        });
      } else {
        addResult({ name: 'Image fetch test', ok: true, details: 'No QR tokens or no qrUrl found to test.' });
      }

      if (menu.ok) {
        const cats = (menu.data as any)?.data?.categories;
        addResult({ name: 'Menu categories summary', ok: true, details: {
          count: Array.isArray(cats) ? cats.length : 0,
          sample: Array.isArray(cats) ? cats.slice(0, 10).map((c: any) => ({ id: c.id, name: c.name })) : []
        }});
      }

    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">QR Codes Debug</h1>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
              onClick={() => router.push('/business/qr-codes')}
            >
              QR Kodlar
            </button>
            <button
              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              onClick={runAll}
              disabled={running}
            >
              {running ? 'Çalışıyor...' : 'Hepsini Test Et'}
            </button>
          </div>
        </div>

        <div className="bg-white border rounded p-4 mb-4">
          <div className="text-sm text-gray-700">API Base: <span className="font-mono">{apiBase || '(empty)'}</span></div>
          <div className="text-sm text-gray-700 mt-1">Restaurant ID: <span className="font-mono">{restaurantId || '(none)'}</span></div>
        </div>

        <div className="space-y-3">
          {results.map((r, idx) => (
            <div key={idx} className={`border rounded p-3 bg-white ${r.ok ? 'border-green-200' : 'border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{r.name}</div>
                <div className={`text-xs ${r.ok ? 'text-green-700' : 'text-red-700'}`}>{r.ok ? 'OK' : 'FAIL'}{typeof r.ms === 'number' ? ` • ${r.ms}ms` : ''}</div>
              </div>
              {r.error ? (
                <pre className="mt-2 text-xs whitespace-pre-wrap break-words bg-gray-100 rounded p-2 text-red-700">{String(r.error)}</pre>
              ) : null}
              {typeof r.details !== 'undefined' ? (
                <pre className="mt-2 text-xs whitespace-pre-wrap break-words bg-gray-100 rounded p-2 text-gray-800">{safeStringify(r.details)}</pre>
              ) : null}
            </div>
          ))}
        </div>

        {imageChecks.length > 0 ? (
          <div className="mt-6 bg-white border rounded p-4">
            <div className="font-medium text-gray-900 mb-2">QR Image Checks</div>
            <div className="space-y-2">
              {imageChecks.map((c, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-mono break-all text-gray-800">{c.url}</div>
                    <div className={c.ok ? 'text-green-700' : 'text-red-700'}>{c.ok ? 'OK' : `FAIL${c.error ? ` (${c.error})` : ''}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
