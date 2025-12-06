'use client';

import React, { useState, useEffect } from 'react';
import { FaMagic, FaDownload, FaUndo, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { ProcessedImage, EnhancementSuggestion, ImageEnhancementOptions } from '@/lib/aiImageProcessor';

interface AIImagePreviewProps {
  processedImage: ProcessedImage;
  onAccept: (imageBlob: Blob) => void;
  onReject: () => void;
  onReapply: (options: ImageEnhancementOptions) => void;
  isProcessing?: boolean;
}

export default function AIImagePreview({
  processedImage,
  onAccept,
  onReject,
  onReapply,
  isProcessing = false
}: AIImagePreviewProps) {
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedEnhancements, setSelectedEnhancements] = useState<EnhancementSuggestion[]>([]);

  useEffect(() => {
    // URL'leri oluştur
    const original = URL.createObjectURL(processedImage.original);
    const processed = URL.createObjectURL(processedImage.processed);
    
    setOriginalUrl(original);
    setProcessedUrl(processed);

    // Yüksek öncelikli önerileri otomatik seç
    const highPrioritySuggestions = processedImage.enhancements.filter(
      enhancement => enhancement.priority === 'high'
    );
    setSelectedEnhancements(highPrioritySuggestions);

    return () => {
      URL.revokeObjectURL(original);
      URL.revokeObjectURL(processed);
    };
  }, [processedImage]);

  const handleAccept = () => {
    onAccept(processedImage.processed);
  };

  const handleReapply = () => {
    const options: ImageEnhancementOptions = {
      autoEnhance: true,
      removeBackground: selectedEnhancements.some(e => e.type === 'background')
    };

    // Seçili önerileri uygula
    selectedEnhancements.forEach(enhancement => {
      if (enhancement.value !== undefined) {
        switch (enhancement.type) {
          case 'brightness':
            options.brightness = enhancement.value;
            break;
          case 'contrast':
            options.contrast = enhancement.value;
            break;
          case 'saturation':
            options.saturation = enhancement.value;
            break;
          case 'sharpness':
            options.sharpness = enhancement.value;
            break;
        }
      }
    });

    onReapply(options);
  };

  const toggleEnhancement = (enhancement: EnhancementSuggestion) => {
    setSelectedEnhancements(prev => {
      const isSelected = prev.some(e => e.type === enhancement.type);
      if (isSelected) {
        return prev.filter(e => e.type !== enhancement.type);
      } else {
        return [...prev, enhancement];
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getEnhancementIcon = (type: string) => {
    switch (type) {
      case 'brightness': return '☀️';
      case 'contrast': return '🔍';
      case 'saturation': return '🎨';
      case 'background': return '✂️';
      case 'sharpness': return '⚡';
      default: return '✨';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaMagic className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI Görsel İşleme</h3>
                <p className="text-sm text-gray-500">
                  İşlem süresi: {processedImage.processingTime}ms
                </p>
              </div>
            </div>
            <button
              onClick={onReject}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Görsel Karşılaştırma */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Görsel Karşılaştırma</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showOriginal 
                      ? 'bg-gray-100 text-gray-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {showOriginal ? 'İşlenmiş Görsel' : 'Orijinal Görsel'}
                </button>
              </div>
            </div>

            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <div className="aspect-square flex items-center justify-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <FaSpinner className="animate-spin text-purple-600" size={32} />
                    <p className="text-gray-600">Görsel işleniyor...</p>
                  </div>
                ) : (
                  <img
                    src={showOriginal ? originalUrl : processedUrl}
                    alt={showOriginal ? 'Orijinal görsel' : 'İşlenmiş görsel'}
                    className="max-w-full max-h-96 object-contain"
                  />
                )}
              </div>
              
              {/* Karşılaştırma Overlay */}
              {!showOriginal && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                  ✨ AI İşlenmiş
                </div>
              )}
            </div>
          </div>

          {/* AI Önerileri */}
          {processedImage.enhancements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Önerileri</h4>
              <div className="grid gap-3">
                {processedImage.enhancements.map((enhancement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedEnhancements.some(e => e.type === enhancement.type)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleEnhancement(enhancement)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getEnhancementIcon(enhancement.type)}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {enhancement.message}
                          </p>
                          {enhancement.value && (
                            <p className="text-sm text-gray-500">
                              Önerilen değer: {enhancement.value > 0 ? '+' : ''}{enhancement.value}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(enhancement.priority)}`}>
                          {enhancement.priority}
                        </span>
                        {selectedEnhancements.some(e => e.type === enhancement.type) && (
                          <FaCheck className="text-purple-600" size={16} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* İstatistikler */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">İşlem İstatistikleri</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {processedImage.enhancements.length}
                </div>
                <div className="text-sm text-blue-600">Toplam Öneri</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedEnhancements.length}
                </div>
                <div className="text-sm text-green-600">Seçili Öneri</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {processedImage.processingTime}ms
                </div>
                <div className="text-sm text-purple-600">İşlem Süresi</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((selectedEnhancements.length / processedImage.enhancements.length) * 100) || 0}%
                </div>
                <div className="text-sm text-orange-600">Uygulama Oranı</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Aksiyon Butonları */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={handleReapply}
                disabled={isProcessing || selectedEnhancements.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaUndo size={16} />
                Yeniden Uygula
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onReject}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaCheck size={16} />
                Kabul Et
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
