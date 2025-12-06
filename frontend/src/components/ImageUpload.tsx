'use client';

import { useState, useRef } from 'react';
import { FaCamera, FaUpload, FaTimes, FaImage } from 'react-icons/fa';

interface ImageUploadProps {
  onImageSelect: (file: File, imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

export default function ImageUpload({ onImageSelect, currentImage, className = '' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Dosya boyutunu kontrol et (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.');
          return;
        }

        // Yeni dosya yükleme sistemi kullan
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          setPreview(result.data.imageUrl);
          onImageSelect(file, result.data.imageUrl);
          setShowOptions(false);
        } else {
          alert('Resim yüklenemedi: ' + result.message);
        }
      } catch (error) {
        console.error('Resim yükleme hatası:', error);
        alert('Resim yüklenirken hata oluştu');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setPreview('');
    setShowOptions(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Image Preview */}
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setShowOptions(true)}
                className="p-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100"
              >
                <FaCamera />
              </button>
              <button
                onClick={removeImage}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowOptions(true)}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaImage size={48} className="mb-2" />
          <span className="text-sm font-medium">Fotoğraf Ekle</span>
          <span className="text-xs">Galeriden seç veya fotoğraf çek</span>
        </button>
      )}

      {/* Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-center">Fotoğraf Seç</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-3"
              >
                <FaCamera size={20} />
                <span>Fotoğraf Çek</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-3"
              >
                <FaUpload size={20} />
                <span>Galeriden Seç</span>
              </button>
              
              <button
                onClick={() => setShowOptions(false)}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
    </div>
  );
}
