'use client';

import { useState, useRef } from 'react';
import { FaUpload, FaFileAlt, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

interface MenuImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => void;
}

export default function MenuImport({ isOpen, onClose, onImport }: MenuImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping'>('upload');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo menü şablonları
  const menuTemplates = [
    {
      id: 'turkish-restaurant',
      name: 'Türk Restoranı',
      description: 'Geleneksel Türk mutfağı menüsü',
      items: [
        { name: 'Mercimek Çorbası', category: 'Çorbalar', price: 25, description: 'Geleneksel mercimek çorbası' },
        { name: 'Adana Kebap', category: 'Ana Yemekler', price: 85, description: 'Acılı kıyma kebabı' },
        { name: 'Urfa Kebap', category: 'Ana Yemekler', price: 80, description: 'Acısız kıyma kebabı' },
        { name: 'Çoban Salata', category: 'Salatalar', price: 35, description: 'Domates, salatalık, soğan' },
        { name: 'Ayran', category: 'İçecekler', price: 15, description: 'Ev yapımı ayran' },
        { name: 'Baklava', category: 'Tatlılar', price: 45, description: 'Fıstıklı baklava' }
      ]
    },
    {
      id: 'cafe-menu',
      name: 'Kafe Menüsü',
      description: 'Modern kafe menüsü',
      items: [
        { name: 'Americano', category: 'Kahveler', price: 20, description: 'Sıcak americano' },
        { name: 'Cappuccino', category: 'Kahveler', price: 25, description: 'Köpüklü cappuccino' },
        { name: 'Latte', category: 'Kahveler', price: 28, description: 'Sütlü latte' },
        { name: 'Cheesecake', category: 'Tatlılar', price: 35, description: 'New York cheesecake' },
        { name: 'Brownie', category: 'Tatlılar', price: 30, description: 'Çikolatalı brownie' },
        { name: 'Caesar Salad', category: 'Salatalar', price: 45, description: 'Tavuklu caesar salata' }
      ]
    },
    {
      id: 'fast-food',
      name: 'Fast Food',
      description: 'Hızlı servis menüsü',
      items: [
        { name: 'Cheeseburger', category: 'Burgerler', price: 35, description: 'Peynirli hamburger' },
        { name: 'Chicken Burger', category: 'Burgerler', price: 40, description: 'Tavuk burger' },
        { name: 'French Fries', category: 'Yan Ürünler', price: 20, description: 'Patates kızartması' },
        { name: 'Onion Rings', category: 'Yan Ürünler', price: 25, description: 'Soğan halkası' },
        { name: 'Cola', category: 'İçecekler', price: 15, description: 'Soğuk kola' },
        { name: 'Milkshake', category: 'İçecekler', price: 30, description: 'Vanilyalı milkshake' }
      ]
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let data;
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(text);
        } else {
          throw new Error('Desteklenmeyen dosya formatı');
        }
        
        setImportData(data);
        setStep('preview');
        setSelectedItems(data.map((_: any, index: number) => index));
      } catch (error) {
        alert('Dosya okuma hatası: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.trim());
      const item: any = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      return item;
    });
  };

  const handleTemplateSelect = (template: any) => {
    setImportData(template.items);
    setStep('preview');
    setSelectedItems(template.items.map((_: any, index: number) => index));
  };

  const toggleItemSelection = (index: number) => {
    setSelectedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleImport = () => {
    const itemsToImport = importData.filter((_, index) => selectedItems.includes(index));
    onImport(itemsToImport);
    onClose();
    setStep('upload');
    setImportData([]);
    setSelectedItems([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Menü İçe Aktarma</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Dosya Yükle</h3>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Dosyayı buraya sürükleyin veya seçin
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    JSON, CSV formatları desteklenir
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Dosya Seç
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Templates */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Hazır Şablonlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {menuTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaFileAlt className="text-purple-600" />
                        <h4 className="font-semibold">{template.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <p className="text-xs text-gray-500">{template.items.length} ürün</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Önizleme ve Seçim</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItems(importData.map((_, i) => i))}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded"
                  >
                    Tümünü Seç
                  </button>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded"
                  >
                    Tümünü Kaldır
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left">Seç</th>
                      <th className="p-3 text-left">Ürün Adı</th>
                      <th className="p-3 text-left">Kategori</th>
                      <th className="p-3 text-left">Fiyat</th>
                      <th className="p-3 text-left">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.map((item, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(index)}
                            onChange={() => toggleItemSelection(index)}
                            className="w-4 h-4 text-purple-600"
                          />
                        </td>
                        <td className="p-3 font-medium">{item.name || item.Name || '-'}</td>
                        <td className="p-3">{item.category || item.Category || '-'}</td>
                        <td className="p-3">₺{item.price || item.Price || '0'}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {item.description || item.Description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Geri
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} ürün seçildi
                  </span>
                  <button
                    onClick={handleImport}
                    disabled={selectedItems.length === 0}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaCheck />
                    İçe Aktar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
