'use client';

import { useState } from 'react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';

export default function UploadTestPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [result, setResult] = useState<any>(null);

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
        setStatus(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/api/upload/image`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setStatus({ type: 'success', message: 'Resim başarıyla Cloudinary\'ye yüklendi!' });
                setResult(data.data);
            } else {
                setStatus({ type: 'error', message: data.message || 'Yükleme başarısız oldu.' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus({ type: 'error', message: 'Sunucuyla bağlantı kurulamadı.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-blue-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">📸 Cloudinary Test Alanı</h1>
                        <p className="text-blue-100 mt-2">Resim yükleyerek kalıcı depolamayı test edin.</p>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Test Resmini Seçin
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                            Dosya seçin
                                        </span>
                                        <p className="pl-1">veya sürükleyip bırakın</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (max. 10MB)</p>
                                </div>
                            </div>
                        </div>

                        {preview && (
                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Önizleme</h3>
                                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                                    <img
                                        src={preview}
                                        alt="Önizleme"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className={`mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                        } transition-colors`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Yükleniyor...
                                        </>
                                    ) : 'Şimdi Yükle'}
                                </button>
                            </div>
                        )}

                        {status && (
                            <div className={`p-4 rounded-xl mb-6 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        {status.type === 'success' ? (
                                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="ml-3 font-medium">{status.message}</div>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Sonuç:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Yüklendi (Cloudinary):</p>
                                        <div className="mt-2 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-white">
                                            <img
                                                src={result.imageUrl}
                                                alt="Yüklenen Resim"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</p>
                                            <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 break-all hover:underline">
                                                {result.imageUrl}
                                            </a>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Public ID</p>
                                            <p className="text-sm text-gray-900 font-mono">{result.publicId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Boyut</p>
                                            <p className="text-sm text-gray-900">{Math.round(result.size / 1024)} KB ({result.width}x{result.height})</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    Bu sayfa sadece teknik test amaçlıdır. Yüklenen resimler Cloudinary "restxqr" klasöründe saklanır.
                </div>
            </div>
        </div>
    );
}
