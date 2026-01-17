'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Sayfa Bulunamadı</h1>
        <p className="text-gray-600 mb-6">
          Aradığınız sayfa bulunamadı veya kaldırılmış olabilir.
        </p>
        <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-md transition-colors">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
