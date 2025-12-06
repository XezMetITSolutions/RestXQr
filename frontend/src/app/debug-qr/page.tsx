'use client';

import { useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';

type Json = any;

export default function DebugQRPage() {
  const [hostname, setHostname] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [table, setTable] = useState<string>('5');
  const [token, setToken] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<Json>(null);
  const [generateResult, setGenerateResult] = useState<Json>(null);
  const [info, setInfo] = useState<Json>(null);

  const API_URL = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
    return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const sd = host.split('.')[0] || '';
      setHostname(host);
      setSubdomain(sd);
      try {
        const stored = sessionStorage.getItem('qr_token') || sessionStorage.getItem('qr-session-token') || '';
        if (stored) setToken(stored);
      } catch {}
    }
  }, []);

  const doVerify = async () => {
    setVerifyResult(null);
    try {
      if (!token) {
        setVerifyResult({ error: true, message: 'Token girin' });
        return;
      }
      const res = await fetch(`${API_URL}/qr/verify/${token}`);
      const data = await safeJson(res);
      setVerifyResult({ status: res.status, ok: res.ok, data });
    } catch (e: any) {
      setVerifyResult({ error: true, message: e?.message || 'Verify failed' });
    }
  };

  const doGenerate = async () => {
    setGenerateResult(null);
    try {
      const sd = subdomain;
      const headers: HeadersInit = { 'Content-Type': 'application/json', 'X-Subdomain': sd || 'hazal' };
      const restaurantId = await fetchRestaurantId(sd);
      if (!restaurantId) {
        setGenerateResult({ error: true, message: 'Restaurant bulunamadı' });
        return;
      }
      const res = await fetch(`${API_URL}/qr/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ restaurantId, tableNumber: Number(table) || 5, duration: 24 })
      });
      const data = await safeJson(res);
      setGenerateResult({ status: res.status, ok: res.ok, data });
      if (data?.success && data?.data?.token) {
        setToken(data.data.token);
        try { sessionStorage.setItem('qr-session-token', data.data.token); } catch {}
      }
    } catch (e: any) {
      setGenerateResult({ error: true, message: e?.message || 'Generate failed' });
    }
  };

  const loadInfo = async () => {
    setInfo({ hostname, subdomain, API_URL, token, table });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">🧪 QR Debug</h1>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">Ortam</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <div>Hostname: {hostname || '-'}</div>
            <div>Subdomain: {subdomain || '-'}</div>
            <div>API URL: {API_URL}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-3">Parametreler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2" placeholder="table" value={table} onChange={e=>setTable(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="token" value={token} onChange={e=>setToken(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={doVerify} className="bg-indigo-600 text-white rounded px-4 py-2">Doğrula</button>
              <button onClick={doGenerate} className="bg-green-600 text-white rounded px-4 py-2">Oluştur</button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Doğrulama Sonucu</h3>
            {verifyResult && (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(verifyResult, null, 2)}</pre>
            )}
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Token Oluşturma Sonucu</h3>
            {generateResult && (
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(generateResult, null, 2)}</pre>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Bilgi</h3>
          <button onClick={loadInfo} className="bg-gray-800 text-white rounded px-4 py-2">Yükle</button>
          {info && (
            <pre className="mt-3 text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(info, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return { note: 'non-json response', status: res.status }; }
}

async function fetchRestaurantId(subdomain: string): Promise<string | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
    const API = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
    const res = await fetch(`${API}/staff/restaurants`);
    const data = await res.json();
    const r = data?.data?.find((x: any) => x.username === subdomain);
    return r?.id || null;
  } catch { return null; }
}


