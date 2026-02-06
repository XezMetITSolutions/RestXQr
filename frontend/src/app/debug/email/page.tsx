'use client';

import { useState } from 'react';
import { FaEnvelope, FaCheckCircle, FaExclamationCircle, FaSpinner, FaBug } from 'react-icons/fa';

export default function EmailDebugPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<any>(null);

    const testEmail = async () => {
        setStatus('loading');
        setResult(null);

        try {
            // API URL'sini standardize et (sonunda /api olup olmadığına bakmaksızın)
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
            // URL zaten /api ile bitiyorsa, endpoint'ten /api kısmını çıkar
            const endpoint = baseUrl.endsWith('/api') ? '/debug/test-email' : '/api/debug/test-email';

            const response = await fetch(`${baseUrl}${endpoint}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
            setResult(data);
        } catch (error: any) {
            console.error('Test error:', error);
            setStatus('error');
            setResult({
                success: false,
                message: 'Ağ hatası veya sunucuya erişilemiyor',
                error: error.message
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <FaBug className="text-yellow-300" />
                                SMTP Debug Aracı
                            </h1>
                            <p className="text-blue-100 mt-1">E-posta sunucu bağlantısını ve gönderimini test et</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <FaEnvelope className="text-2xl" />
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                            <h3 className="font-bold text-blue-800 mb-2">Test Yapılandırması:</h3>
                            <ul className="text-sm text-blue-700 space-y-1 font-mono">
                                <li>Host: w01dc0ea.kasserver.com</li>
                                <li>Port: 587 (TLS: false)</li>
                                <li>User: bp@xezmet.at</li>
                                <li>To: bp@xezmet.at</li>
                            </ul>
                        </div>

                        <button
                            onClick={testEmail}
                            disabled={status === 'loading'}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-3
                ${status === 'loading'
                                    ? 'bg-gray-400 cursor-wait'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-xl'
                                }`}
                        >
                            {status === 'loading' ? (
                                <>
                                    <FaSpinner className="animate-spin text-xl" />
                                    Test Ediliyor...
                                </>
                            ) : (
                                'Test Maili Gönder'
                            )}
                        </button>

                        {result && (
                            <div className={`mt-8 rounded-xl border-l-4 p-6 animate-fade-in ${status === 'success'
                                ? 'bg-green-50 border-green-500'
                                : 'bg-red-50 border-red-500'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 text-2xl ${status === 'success' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {status === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className={`text-lg font-bold mb-2 ${status === 'success' ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {status === 'success' ? 'Başarılı!' : 'Hata Oluştu!'}
                                        </h3>
                                        <p className={`mb-4 ${status === 'success' ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                            {result.message}
                                        </p>

                                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                                                {JSON.stringify(result, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
