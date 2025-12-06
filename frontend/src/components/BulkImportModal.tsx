'use client';

import React, { useState, useRef } from 'react';
import { FaUpload, FaDownload, FaTimes, FaCheck, FaSpinner, FaExclamationTriangle, FaMagic } from 'react-icons/fa';

interface BulkImportModalProps {
  onImport: (items: any[]) => void;
  onClose: () => void;
}

export default function BulkImportModal({ onImport, onClose }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    
    try {
      // Simüle edilmiş import işlemi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setImportResult({
        success: true,
        message: 'Ürünler başarıyla içe aktarıldı!'
      });
      
      // Demo veriler
      const demoItems = [
        {
          id: 'imported-1',
          name: { tr: 'İthalat Ürün 1', en: 'Imported Item 1' },
          price: 25.50,
          category: 'Ana Yemek',
          isAvailable: true
        },
        {
          id: 'imported-2', 
          name: { tr: 'İthalat Ürün 2', en: 'Imported Item 2' },
          price: 18.00,
          category: 'İçecek',
          isAvailable: true
        }
      ];
      
      onImport(demoItems);
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Import hatası:', error);
      setImportResult({
        success: false,
        message: 'İçe aktarma sırasında hata oluştu'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Excel template indirme simülasyonu
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,Ürün Adı (TR),Ürün Adı (EN),Açıklama (TR),Açıklama (EN),Fiyat,Kategori,Hazırlık Süresi,Kalori,Stokta Var mı\nÖrnek Ürün,Example Product,Örnek açıklama,Example description,25.50,Ana Yemek,15,350,TRUE';
    link.download = 'menu_template.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
              <FaUpload className="text-blue-600" />
              </div>
              <div>
              <h2 className="text-xl font-bold text-gray-800">Toplu İçe Aktarım</h2>
              <p className="text-sm text-gray-600">Excel/CSV dosyası ile ürünleri toplu olarak ekleyin</p>
              </div>
            </div>
            <button
              onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
            <FaTimes className="text-lg" />
            </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template İndirme */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">1. Template İndirin</h3>
                <p className="text-sm text-gray-600">Önce örnek dosyayı indirip doldurun</p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaDownload />
                Template İndir
              </button>
            </div>
          </div>

          {/* Dosya Seçimi */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">2. Dosyanızı Seçin</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
                <div className="space-y-3">
                <FaUpload className="text-4xl text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {file ? file.name : 'Dosya seçmek için tıklayın'}
                  </p>
                    <p className="text-sm text-gray-500">
                    Excel (.xlsx, .xls) veya CSV dosyaları desteklenir
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Dosya Seç
                  </button>
                </div>
            </div>
          </div>

          {/* AI Özellikleri */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <FaMagic className="text-purple-600" />
              <h3 className="font-semibold text-purple-800">AI Özellikleri</h3>
                </div>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Ürün fotoğrafları otomatik iyileştirilir</li>
              <li>• Arka planlar otomatik kaldırılır</li>
              <li>• Renk ve parlaklık optimize edilir</li>
              <li>• Akıllı kategori önerileri</li>
            </ul>
                </div>

          {/* Sonuç */}
          {importResult && (
              <div className={`p-4 rounded-lg ${
                importResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
              <div className="flex items-center gap-2">
                  {importResult.success ? (
                  <FaCheck className="text-green-600" />
                ) : (
                  <FaExclamationTriangle className="text-red-600" />
                )}
                <p className={`font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleImport}
                disabled={!file || isImporting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isImporting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  İçe Aktarılıyor...
                </>
                ) : (
                <>
                  <FaUpload />
                  İçe Aktar
                </>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
