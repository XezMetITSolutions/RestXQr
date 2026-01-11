'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaExternalLinkAlt, FaImage, FaSpinner } from 'react-icons/fa';

export default function DebugImages() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [uploadDir, setUploadDir] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [endpointTest, setEndpointTest] = useState<any>(null);

  const fetchFiles = async (pageNum: number = 1, searchTerm: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      const url = `${apiUrl}/debug/list-files?page=${pageNum}&limit=30&search=${encodeURIComponent(searchTerm)}`;
      
      console.log('🔍 Fetching files from:', url);
      
      const response = await fetch(url);
      
      // Response status kontrolü
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText, status: response.status };
        }
        
        console.error('❌ HTTP Error:', response.status, errorData);
        setError(`HTTP ${response.status}: ${errorData.error || errorData.message || 'Bilinmeyen hata'}`);
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          url: url,
          error: errorData
        });
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      console.log('📦 Response:', data);
      
      if (data.success) {
        setFiles(data.files || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setUploadDir(data.uploadDir || '');
        setDebugInfo({
          uploadDir: data.uploadDir,
          scannedDirectories: data.scannedDirectories,
          message: data.message
        });
      } else {
        setError(data.message || 'Dosyalar yüklenemedi');
        setDebugInfo(data);
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen hata');
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Önce test endpoint'ini kontrol et
    const testEndpoint = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
        const testResponse = await fetch(`${apiUrl}/debug/test`);
        const testData = await testResponse.json();
        setEndpointTest({
          success: testResponse.ok,
          data: testData,
          status: testResponse.status
        });
      } catch (error) {
        setEndpointTest({
          success: false,
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
      }
    };
    
    testEndpoint();
    fetchFiles(page, search);
  }, [page, search]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('tr-TR');
  };

  const formatSize = (sizeKB: string, sizeMB: string) => {
    const mb = parseFloat(sizeMB);
    if (mb >= 1) {
      return `${sizeMB} MB`;
    }
    return `${sizeKB} KB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🖼️ Backend Görseller</h1>
          <p className="text-gray-600">Backend'de kayıtlı tüm görselleri görüntüleyin</p>
          
          {/* Endpoint Test */}
          {endpointTest && (
            <div className={`mt-4 p-3 rounded-lg ${endpointTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-semibold ${endpointTest.success ? 'text-green-800' : 'text-red-800'}`}>
                {endpointTest.success ? '✅ Test Endpoint Çalışıyor' : '❌ Test Endpoint Çalışmıyor'}
              </p>
              {endpointTest.data && (
                <p className="text-xs text-gray-600 mt-1">{JSON.stringify(endpointTest.data)}</p>
              )}
              {endpointTest.error && (
                <p className="text-xs text-red-600 mt-1">{endpointTest.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Arama ve İstatistikler */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Dosya adında ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ara
            </button>
            {search && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Temizle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-600 font-semibold">Toplam Görsel</p>
              <p className="text-2xl font-bold text-blue-900">{total}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 font-semibold">Sayfa</p>
              <p className="text-2xl font-bold text-green-900">{page} / {totalPages}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-purple-600 font-semibold">Gösterilen</p>
              <p className="text-2xl font-bold text-purple-900">{files.length}</p>
            </div>
          </div>

          {uploadDir && (
            <div className="mt-4 text-xs text-gray-600">
              <p><strong>Upload Klasörü:</strong> {uploadDir}</p>
            </div>
          )}
        </div>

        {/* Dosya Listesi */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-semibold mb-2">❌ Hata</p>
            <p className="text-red-700">{error}</p>
            {debugInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-red-700 font-medium">Debug Bilgileri</summary>
                <pre className="text-xs bg-white p-3 rounded mt-2 overflow-x-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaImage className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Görsel bulunamadı</p>
            {search && (
              <p className="text-gray-500 text-sm mt-2">
                "{search}" için sonuç bulunamadı
              </p>
            )}
            {!search && (
              <div className="mt-4 text-left max-w-2xl mx-auto">
                <p className="text-gray-500 text-sm mb-2">Olası nedenler:</p>
                <ul className="text-gray-500 text-sm list-disc list-inside space-y-1">
                  <li>Backend'de upload klasörü boş olabilir</li>
                  <li>Production ortamında dosyalar farklı bir yerde olabilir</li>
                  <li>Backend endpoint'i çalışmıyor olabilir</li>
                </ul>
                {debugInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-700 font-medium">Debug Bilgileri</summary>
                    <pre className="text-xs bg-gray-50 p-3 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {files.map((file, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Resim Önizlemesi */}
                  <div className="relative bg-gray-100 aspect-square">
                    <img
                      src={file.fullUrl}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-food.jpg';
                        target.className = 'w-full h-full object-contain p-4';
                      }}
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {file.extension.toUpperCase()}
                    </div>
                  </div>

                  {/* Dosya Bilgileri */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate" title={file.filename}>
                      {file.filename}
                    </h3>
                    
                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <p><strong>Boyut:</strong> {formatSize(file.sizeKB, file.sizeMB)}</p>
                      <p><strong>Oluşturulma:</strong> {formatDate(file.created)}</p>
                      <p><strong>Değiştirilme:</strong> {formatDate(file.modified)}</p>
                    </div>

                    {/* URL'ler */}
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <p className="text-gray-500 mb-1">Relative Path:</p>
                        <p className="text-blue-600 break-all font-mono">{file.relativePath}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <p className="text-gray-500 mb-1">Full URL:</p>
                        <p className="text-blue-600 break-all font-mono">{file.fullUrl}</p>
                      </div>
                    </div>

                    {/* Butonlar */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => window.open(file.fullUrl, '_blank')}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FaExternalLinkAlt />
                        Aç
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = file.fullUrl;
                          link.download = file.filename;
                          link.click();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        <FaDownload />
                        İndir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-md p-4 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="text-gray-700">
                  Sayfa {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
