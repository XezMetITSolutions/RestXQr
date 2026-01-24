'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('QR Codes page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white border border-red-200 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold text-red-700">Sayfa yüklenirken hata oluştu</h2>
        <p className="text-sm text-gray-700 mt-2">Console'daki hatayı bana gönderir misin? (F12 → Console)</p>
        <pre className="mt-4 text-xs whitespace-pre-wrap break-words bg-gray-100 rounded p-3 text-gray-800">{String(error?.message || error)}</pre>
        {error?.digest ? (
          <p className="mt-2 text-xs text-gray-500">Digest: {error.digest}</p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <button
            className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={() => reset()}
          >
            Tekrar dene
          </button>
          <a
            className="px-3 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
            href="/business"
          >
            Panele dön
          </a>
        </div>
      </div>
    </div>
  );
}
