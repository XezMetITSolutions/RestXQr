'use client';

import { useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

export default function DebugLoginPage() {
  const [hostname, setHostname] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string>('');

  const API_URL = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
    // Env yanlışlıkla '/api' olmadan gelirse otomatik ekle
    return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      setHostname(host);
      setSubdomain(host.split('.')[0] || '');
    }
  }, []);

  // Business login state
  const [bizUsername, setBizUsername] = useState('hazal');
  const [bizPassword, setBizPassword] = useState('123456');
  const [bizLoading, setBizLoading] = useState(false);
  const [bizResult, setBizResult] = useState<Json>(null);

  // Staff login state
  const [staffUsername, setStaffUsername] = useState('armut');
  const [staffPassword, setStaffPassword] = useState('123456');
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffResult, setStaffResult] = useState<Json>(null);

  // Raw request diagnostics
  const [rawLog, setRawLog] = useState<Json>(null);

  const doBusinessLogin = async () => {
    setBizLoading(true);
    setBizResult(null);
    try {
      const res = await apiService.login({ username: bizUsername, password: bizPassword });
      setBizResult(res);
    } catch (e: any) {
      setBizResult({ error: true, message: e?.message || 'Login failed' });
    } finally {
      setBizLoading(false);
    }
  };

  const doStaffLogin = async () => {
    setStaffLoading(true);
    setStaffResult(null);
    try {
      const sd = subdomain || (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : '');
      const res = await apiService.staffLogin(staffUsername, staffPassword, sd);
      setStaffResult(res);
    } catch (e: any) {
      setStaffResult({ error: true, message: e?.message || 'Login failed' });
    } finally {
      setStaffLoading(false);
    }
  };

  // Make raw requests to inspect headers and responses
  const doRawTest = async () => {
    try {
      const sd = subdomain || (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : '');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Subdomain': sd || 'hazal',
      };

      // Auth (restaurant) login raw
      const authReq = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username: bizUsername, password: bizPassword }),
      });
      const authData = await safeJson(authReq);

      // Staff login raw
      const staffReq = await fetch(`${API_URL}/staff/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username: staffUsername, password: staffPassword, subdomain: sd }),
      });
      const staffData = await safeJson(staffReq);

      setRawLog({
        info: {
          API_URL,
          hostname,
          subdomain: sd,
          sentHeaders: headers,
        },
        auth: {
          status: authReq.status,
          ok: authReq.ok,
          data: authData,
        },
        staff: {
          status: staffReq.status,
          ok: staffReq.ok,
          data: staffData,
        },
      });
    } catch (e: any) {
      setRawLog({ error: true, message: e?.message || 'Raw test failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">🔧 Login Debug</h1>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">Ortam</h2>
          <div className="text-sm text-gray-700">
            <div>Hostname: {hostname || '-'}</div>
            <div>Subdomain: {subdomain || '-'}</div>
            <div>API URL: {API_URL}</div>
          </div>
        </div>

        {/* Business Login */}
        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-3">🏪 Business Login (Restaurant)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="username (ör. hazal/aksaray)"
              value={bizUsername}
              onChange={(e) => setBizUsername(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="password"
              type="password"
              value={bizPassword}
              onChange={(e) => setBizPassword(e.target.value)}
            />
            <button
              onClick={doBusinessLogin}
              disabled={bizLoading}
              className="bg-indigo-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {bizLoading ? 'Gönderiliyor...' : 'Giriş Yap (Auth)'}
            </button>
          </div>
          {bizResult && (
            <pre className="mt-3 text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(bizResult, null, 2)}</pre>
          )}
        </div>

        {/* Staff Login */}
        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-3">👤 Personel Login (Staff)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="staff username (ör. armut)"
              value={staffUsername}
              onChange={(e) => setStaffUsername(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="password"
              type="password"
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="subdomain (otomatik)"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
            />
            <button
              onClick={doStaffLogin}
              disabled={staffLoading}
              className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {staffLoading ? 'Gönderiliyor...' : 'Giriş Yap (Staff)'}
            </button>
          </div>
          {staffResult && (
            <pre className="mt-3 text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(staffResult, null, 2)}</pre>
          )}
        </div>

        {/* Raw */}
        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-3">🧪 Ham İstek Testi (Headers + Yanıt)</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={doRawTest}
              className="bg-gray-800 text-white rounded px-4 py-2"
            >
              Test Et
            </button>
            <span className="text-sm text-gray-600">Gönderilecek X-Subdomain: <strong>{subdomain || '-'}</strong></span>
          </div>
          {rawLog && (
            <pre className="mt-3 text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(rawLog, null, 2)}</pre>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-3">🔗 Hızlı Linkler</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <a className="px-3 py-2 bg-blue-600 text-white rounded" href={`/cashier/`} target="_blank" rel="noreferrer">Kasa Paneli</a>
            <a className="px-3 py-2 bg-blue-600 text-white rounded" href={`/waiter/`} target="_blank" rel="noreferrer">Garson Paneli</a>
            <a className="px-3 py-2 bg-blue-600 text-white rounded" href={`/kitchen/`} target="_blank" rel="noreferrer">Mutfak Paneli</a>
            <a className="px-3 py-2 bg-purple-600 text-white rounded" href={`/isletme-giris/`} target="_blank" rel="noreferrer">Business Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}

async function safeJson(res: Response): Promise<Json> {
  try {
    return await res.json();
  } catch {
    return { note: 'non-json response', status: res.status };
  }
}


