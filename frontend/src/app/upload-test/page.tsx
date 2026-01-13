'use client';

import { useState, useEffect } from 'react';

const DEFAULT_API_URL = 'https://masapp-backend.onrender.com';

export default function UploadTestPage() {
    const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [result, setResult] = useState<any>(null);
    const [backendStatus, setBackendStatus] = useState<any>(null);

    // Backend durumunu kontrol et
    const checkBackend = async () => {
        setStatus({ type: 'info', message: 'Backend kontrol ediliyor...' });
        try {
            const response = await fetch(`${apiUrl}/health`);
            const data = await response.json();
            setBackendStatus(data);
            if (response.ok) {
                setStatus({ type: 'success', message: `Backend aktif! (Durum: ${data.status})` });
            } else {
                setStatus({ type: 'error', message: `Backend hata döndürdü: ${response.status}` });
            }
        } catch (error: any) {
            setBackendStatus({ error: error.message });
            setStatus({ type: 'error', message: `Backend'e erişilemiyor: ${error.message}. Lütfen URL'yi kontrol edin.` });
        }
    };

    useEffect(() => {
        checkBackend();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
            setStatus(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setStatus({ type: 'info', message: 'Yükleniyor...' });

        const formData = new FormData();
        formData.append('image', file);

        const targetUrl = `${apiUrl}/api/upload/image`;

        try {
            console.log(`📤 Yükleme başlatılıyor: ${targetUrl}`);
            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setStatus({ type: 'success', message: 'Resim başarıyla Cloudinary\'ye yüklendi!' });
                setResult(data.data);
            } else {
                setStatus({
                    type: 'error',
                    message: data.message || `Yükleme başarısız (Hata Kodu: ${response.status})`
                });
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setStatus({
                type: 'error',
                message: `Bağlantı Hatası: ${error.message}. Hedef URL: ${targetUrl}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">⚙️ Süper Debug Paneli</h1>
                        <p className="text-blue-100 mt-2">Görsel yükleme ve backend bağlantısını test edin.</p>
                    </div>

                    <div className="p-8">
                        {/* URL Yapılandırması */}
                        <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4">Backend Yapılandırması</h3>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-blue-600 mb-1">Backend URL</label>
                                    <input
                                        type="text"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={checkBackend}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Bağlantıyı Test Et
                                    </button>
                                </div>
                            </div>
                            {backendStatus && (
                                <div className="mt-4 p-3 bg-white rounded-lg text-xs font-mono border border-blue-100 overflow-auto max-h-32">
                                    <pre>{JSON.stringify(backendStatus, null, 2)}</pre>
                                </div>
                            )}
                        </div>

                        {/* Dosya Seçimi */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
                                1. Resim Seçimi
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-blue-400 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                <div className="space-y-2 text-center">
                                    <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-bold text-blue-600">Dosya seçin</span> veya buraya sürükleyin
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (Maks. 10MB)</p>
                                </div>
                            </div>
                        </div>

                        {preview && (
                            <div className="mb-8 animate-in fade-in duration-500">
                                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">2. Önizleme ve Onay</h3>
                                <div className="relative w-full h-80 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50">
                                    <img src={preview} alt="Önizleme" className="w-full h-full object-contain" />
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className={`mt-6 w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-xl font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Buluta Yükleniyor...
                                        </span>
                                    ) : 'Resmi Cloudinary\'ye Gönder'}
                                </button>
                            </div>
                        )}

                        {status && (
                            <div className={`p-5 rounded-2xl mb-8 border-2 animate-in slide-in-from-top duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
                                    status.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
                                        'bg-blue-50 text-blue-800 border-blue-200'
                                }`}>
                                <div className="flex items-center">
                                    <div className="text-2xl mr-3">
                                        {status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : 'ℹ️'}
                                    </div>
                                    <div className="font-bold">{status.message}</div>
                                </div>
                            </div>
                        )}

                        {status?.type === 'error' && (
                            <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
                                <p className="font-bold mb-2">💡 Neyi Kontrol Etmeliyim?</p>
                                <ul className="list-disc ml-5 space-y-1">
                                    <li>Backend URL'nin doğru olduğundan emin olun.</li>
                                    <li>Render.com üzerinde "Environment Variables" ayarlarını (Cloud Name, API Key, Secret) yaptığınızdan emin olun.</li>
                                    <li>Backend servisinin "Active" (Yeşil) durumda olduğunu kontrol edin.</li>
                                    <li>İnternet bağlantınızı kontrol edin.</li>
                                </ul>
                            </div>
                        )}

                        {result && (
                            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100 shadow-sm animate-in zoom-in duration-500">
                                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                                    <span className="bg-green-500 text-white p-1 rounded-md mr-2 text-sm italic">SUCCESS</span>
                                    Yükleme Detayları
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Kalıcı Cloudinary Bağlantısı</p>
                                        <div className="bg-white p-3 rounded-xl border border-gray-200 break-all select-all font-mono text-xs text-blue-600">
                                            {result.imageUrl}
                                        </div>
                                        <a
                                            href={result.imageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                        >
                                            Resmi Yeni Sekmede Aç
                                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    </div>
                                    <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between border-b pb-2 border-gray-50">
                                            <span className="text-gray-500 text-xs font-bold uppercase">Public ID</span>
                                            <span className="text-gray-900 text-xs font-mono font-bold">{result.publicId}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2 border-gray-50">
                                            <span className="text-gray-500 text-xs font-bold uppercase">Format</span>
                                            <span className="text-gray-900 text-xs font-bold">{result.format.toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-xs font-bold uppercase">Çözünürlük</span>
                                            <span className="text-gray-900 text-xs font-bold">{result.width} x {result.height}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
                    🚀 RestXQr Kalıcı Görsel Sistemi &bull; Teşhis Modu
                </div>
            </div>
        </div>
    );
}
