'use client';

import React, { useState, useRef } from 'react';
import { FaUpload, FaTimes, FaCheck, FaUndo, FaRedo, FaCrop, FaMagic } from 'react-icons/fa';

interface ImageUploaderProps {
  onImageSelect: (imageBlob: Blob) => void;
  onClose: () => void;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
}

export default function ImageUploader({ 
  onImageSelect, 
  onClose, 
  aspectRatio = 'square' 
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Kamera boyutları
  const getImageDimensions = () => {
    switch (aspectRatio) {
      case 'square':
        return { width: 400, height: 400 };
      case 'landscape':
        return { width: 600, height: 400 };
      case 'portrait':
        return { width: 400, height: 600 };
      default:
        return { width: 400, height: 400 };
    }
  };

  const { width, height } = getImageDimensions();

  // Dosya seçimi
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir resim dosyası seçin.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Döndürme
  const rotateImage = (direction: 'left' | 'right') => {
    setRotation(prev => prev + (direction === 'left' ? -90 : 90));
  };

  // Boyutlandırma ve işleme
  const processImage = async () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        
        if (!canvas || !ctx) return;

        // Canvas boyutlarını ayarla
        canvas.width = width;
        canvas.height = height;

        // Görüntüyü boyutlandır ve döndür
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-width / 2, -height / 2);

        // Aspect ratio korunarak boyutlandırma
        const scale = Math.min(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        ctx.restore();

        // Canvas'ı blob'a çevir
        canvas.toBlob((blob) => {
          if (blob) {
            onImageSelect(blob);
            onClose();
          }
          setIsProcessing(false);
        }, 'image/jpeg', 0.9);
      };
      
      img.src = selectedImage;
    } catch (error) {
      console.error('Görüntü işleme hatası:', error);
      setIsProcessing(false);
    }
  };

  // Yeniden seç
  const reselectImage = () => {
    setSelectedImage(null);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Görsel Yükle ve Düzenle</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedImage ? (
            /* Dosya Seçimi */
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaUpload className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Görsel Dosyası Seçin</h3>
                <p className="text-gray-600 mb-6">
                  PNG, JPG, GIF formatlarında, maksimum 10MB boyutunda dosya yükleyebilirsiniz.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
                >
                  <FaUpload size={16} />
                  Dosya Seç
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  veya dosyayı buraya sürükleyin
                </p>
              </div>

              {/* Boyut Bilgisi */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📐 Hedef Boyutlar</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Kare:</strong> {width}x{height}px (1:1 oran)</p>
                  <p><strong>Kalite:</strong> Yüksek çözünürlük, optimize edilmiş boyut</p>
                  <p><strong>Format:</strong> Otomatik JPEG dönüşümü</p>
                </div>
              </div>
            </div>
          ) : (
            /* Görsel Düzenleme */
            <div className="space-y-6">
              {/* Önizleme */}
              <div className="relative bg-gray-100 rounded-lg p-4 flex justify-center">
                <img
                  src={selectedImage}
                  alt="Seçilen görsel"
                  className="max-w-full max-h-96 object-contain rounded-lg"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>

              {/* Düzenleme Kontrolleri */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Düzenleme Araçları</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rotateImage('left')}
                      className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Sola döndür"
                    >
                      <FaUndo size={16} />
                    </button>
                    <button
                      onClick={() => rotateImage('right')}
                      className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Sağa döndür"
                    >
                      <FaRedo size={16} />
                    </button>
                  </div>
                </div>

                {/* Boyut Bilgisi */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Döndürme: {rotation}°</span>
                    <span>Hedef: {width}x{height}px</span>
                  </div>
                </div>

                {/* İşleme Seçenekleri */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={reselectImage}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <FaUpload size={14} />
                    Yeniden Seç
                  </button>
                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <FaCheck size={14} />
                        Onayla
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Gelecek Özellikler */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <FaMagic className="text-purple-600" />
                  Gelecek Özellikler
                </h4>
                <div className="text-sm text-purple-800 space-y-1">
                  <p>🤖 AI arka plan kaldırma</p>
                  <p>🎨 Otomatik renk düzenleme</p>
                  <p>✨ Parlaklık ve kontrast ayarları</p>
                  <p>🖼️ Profesyonel filtreler</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gizli Canvas */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    </div>
  );
}
