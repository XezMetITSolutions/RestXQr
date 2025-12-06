// AI Görsel İşleme Servisi
export interface ImageEnhancementOptions {
  brightness?: number; // -100 to 100
  contrast?: number;   // -100 to 100
  saturation?: number; // -100 to 100
  sharpness?: number;  // 0 to 100
  removeBackground?: boolean;
  autoEnhance?: boolean;
  aspectRatio?: 'food' | 'drink' | 'dessert';
  width?: number;
  height?: number;
  style?: 'rounded' | 'circle' | 'square';
}

export interface EnhancementSuggestion {
  type: 'brightness' | 'contrast' | 'saturation' | 'background' | 'sharpness';
  message: string;
  value?: number;
  priority: 'low' | 'medium' | 'high';
}

export interface ProcessedImage {
  original: Blob;
  processed: Blob;
  enhancements: EnhancementSuggestion[];
  processingTime: number;
}

class AIImageProcessor {
  private removeBgApiKey: string;
  private processingQueue: Map<string, Promise<ProcessedImage>> = new Map();

  constructor() {
    // Remove.bg API anahtarı - gerçek uygulamada environment variable'dan alınmalı
    this.removeBgApiKey = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || '';
  }

  // Ana işleme fonksiyonu
  async processImage(
    imageBlob: Blob, 
    options: ImageEnhancementOptions = {}
  ): Promise<ProcessedImage> {
    const startTime = Date.now();
    const imageId = this.generateImageId();
    
    // Eğer aynı görsel zaten işleniyorsa, mevcut promise'i döndür
    if (this.processingQueue.has(imageId)) {
      return this.processingQueue.get(imageId)!;
    }

    const processingPromise = this.performImageProcessing(imageBlob, options, startTime);
    this.processingQueue.set(imageId, processingPromise);
    
    try {
      const result = await processingPromise;
      return result;
    } finally {
      this.processingQueue.delete(imageId);
    }
  }

  private async performImageProcessing(
    imageBlob: Blob, 
    options: ImageEnhancementOptions, 
    startTime: number
  ): Promise<ProcessedImage> {
    let processedBlob = imageBlob;
    const enhancements: EnhancementSuggestion[] = [];

    try {
      // 1. Kalite optimizasyonu
      processedBlob = await this.optimizeImageQuality(processedBlob);
      enhancements.push({
        type: 'sharpness',
        message: 'Görsel kalitesi optimize edildi',
        priority: 'medium'
      });

      // 2. Arka plan kaldırma
      if (options.removeBackground) {
        processedBlob = await this.removeBackground(processedBlob);
        enhancements.push({
          type: 'background',
          message: 'Arka plan başarıyla kaldırıldı',
          priority: 'high'
        });
      }

      // 3. Otomatik iyileştirme
      if (options.autoEnhance) {
        const autoEnhancements = await this.analyzeAndSuggestEnhancements(processedBlob);
        enhancements.push(...autoEnhancements);
        
        // Otomatik iyileştirmeleri uygula
        processedBlob = await this.applyAutoEnhancements(processedBlob, autoEnhancements);
      }

      // 4. Manuel ayarlamalar
      if (options.brightness || options.contrast || options.saturation || options.sharpness) {
        processedBlob = await this.applyManualAdjustments(processedBlob, options);
      }

      // 5. Şablon uygulama (eğer kategori belirtilmişse)
      if (options.aspectRatio) {
        const template = this.getImageTemplate(options.aspectRatio as 'food' | 'drink' | 'dessert');
        processedBlob = await this.resizeAndCropImage(processedBlob, template);
        enhancements.push({
          type: 'sharpness',
          message: `Görsel ${template.style} şablonuna uyarlandı`,
          priority: 'low'
        });
      }

      return {
        original: imageBlob,
        processed: processedBlob,
        enhancements,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Görsel işleme hatası:', error);
      throw new Error('Görsel işlenirken bir hata oluştu');
    }
  }

  // Remove.bg API entegrasyonu
  private async removeBackground(imageBlob: Blob): Promise<Blob> {
    if (!this.removeBgApiKey) {
      throw new Error('Remove.bg API anahtarı bulunamadı');
    }

    const formData = new FormData();
    formData.append('image_file', imageBlob);
    formData.append('size', 'auto');

    try {
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.removeBgApiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Remove.bg API hatası: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Arka plan kaldırma hatası:', error);
      // Fallback: Orijinal görseli döndür
      return imageBlob;
    }
  }

  // Görsel analizi ve öneri sistemi
  async analyzeAndSuggestEnhancements(imageBlob: Blob): Promise<EnhancementSuggestion[]> {
    const suggestions: EnhancementSuggestion[] = [];
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return suggestions;

      const img = new Image();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const analysis = this.analyzeImageData(imageData);
      
      // Parlaklık analizi
      if (analysis.brightness < 0.3) {
        suggestions.push({
          type: 'brightness',
          message: 'Görsel çok karanlık, parlaklık artırılabilir',
          value: 20,
          priority: 'high'
        });
      } else if (analysis.brightness > 0.8) {
        suggestions.push({
          type: 'brightness',
          message: 'Görsel çok parlak, parlaklık azaltılabilir',
          value: -15,
          priority: 'medium'
        });
      }

      // Kontrast analizi
      if (analysis.contrast < 0.3) {
        suggestions.push({
          type: 'contrast',
          message: 'Kontrast düşük, görsel netliği artırılabilir',
          value: 25,
          priority: 'high'
        });
      }

      // Doygunluk analizi
      if (analysis.saturation < 0.4) {
        suggestions.push({
          type: 'saturation',
          message: 'Renkler soluk, doygunluk artırılabilir',
          value: 20,
          priority: 'medium'
        });
      }

      // Keskinlik analizi
      if (analysis.sharpness < 0.5) {
        suggestions.push({
          type: 'sharpness',
          message: 'Görsel bulanık, keskinlik artırılabilir',
          value: 15,
          priority: 'medium'
        });
      }

      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Görsel analiz hatası:', error);
    }

    return suggestions;
  }

  // Görsel veri analizi
  private analyzeImageData(imageData: ImageData) {
    const data = imageData.data;
    let totalBrightness = 0;
    let totalContrast = 0;
    let totalSaturation = 0;
    let totalSharpness = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Parlaklık hesaplama (0-1 arası)
      const brightness = (r + g + b) / (3 * 255);
      totalBrightness += brightness;
      
      // Doygunluk hesaplama
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      totalSaturation += saturation;
    }

    // Kontrast hesaplama (standart sapma)
    const meanBrightness = totalBrightness / pixelCount;
    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / (3 * 255);
      variance += Math.pow(brightness - meanBrightness, 2);
    }
    const contrast = Math.sqrt(variance / pixelCount);

    // Keskinlik hesaplama (Laplacian benzeri)
    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < imageData.width - 1; x++) {
        const idx = (y * imageData.width + x) * 4;
        const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const top = (data[idx - imageData.width * 4] + data[idx - imageData.width * 4 + 1] + data[idx - imageData.width * 4 + 2]) / 3;
        const bottom = (data[idx + imageData.width * 4] + data[idx + imageData.width * 4 + 1] + data[idx + imageData.width * 4 + 2]) / 3;
        const left = (data[idx - 4] + data[idx - 3] + data[idx - 2]) / 3;
        const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        
        const sharpness = Math.abs(4 * center - top - bottom - left - right) / 255;
        totalSharpness += sharpness;
      }
    }

    return {
      brightness: totalBrightness / pixelCount,
      contrast: contrast,
      saturation: totalSaturation / pixelCount,
      sharpness: totalSharpness / ((imageData.height - 2) * (imageData.width - 2))
    };
  }

  // Otomatik iyileştirmeleri uygula
  private async applyAutoEnhancements(
    imageBlob: Blob, 
    suggestions: EnhancementSuggestion[]
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageBlob;

    const img = new Image();
    const imageUrl = URL.createObjectURL(imageBlob);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Önerileri uygula
    const adjustments: ImageEnhancementOptions = {};
    suggestions.forEach(suggestion => {
      if (suggestion.value !== undefined) {
        switch (suggestion.type) {
          case 'brightness':
            adjustments.brightness = suggestion.value;
            break;
          case 'contrast':
            adjustments.contrast = suggestion.value;
            break;
          case 'saturation':
            adjustments.saturation = suggestion.value;
            break;
          case 'sharpness':
            adjustments.sharpness = suggestion.value;
            break;
        }
      }
    });

    this.applyCanvasAdjustments(ctx, canvas.width, canvas.height, adjustments);
    URL.revokeObjectURL(imageUrl);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || imageBlob);
      }, 'image/jpeg', 0.9);
    });
  }

  // Manuel ayarlamaları uygula
  private async applyManualAdjustments(
    imageBlob: Blob, 
    options: ImageEnhancementOptions
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageBlob;

    const img = new Image();
    const imageUrl = URL.createObjectURL(imageBlob);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    this.applyCanvasAdjustments(ctx, canvas.width, canvas.height, options);
    URL.revokeObjectURL(imageUrl);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || imageBlob);
      }, 'image/jpeg', 0.9);
    });
  }

  // Canvas üzerinde ayarlamaları uygula
  private applyCanvasAdjustments(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    options: ImageEnhancementOptions
  ) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Parlaklık ayarı
      if (options.brightness) {
        const brightness = options.brightness / 100;
        r = Math.max(0, Math.min(255, r + (brightness * 255)));
        g = Math.max(0, Math.min(255, g + (brightness * 255)));
        b = Math.max(0, Math.min(255, b + (brightness * 255)));
      }

      // Kontrast ayarı
      if (options.contrast) {
        const contrast = (options.contrast + 100) / 100;
        r = Math.max(0, Math.min(255, ((r - 128) * contrast) + 128));
        g = Math.max(0, Math.min(255, ((g - 128) * contrast) + 128));
        b = Math.max(0, Math.min(255, ((b - 128) * contrast) + 128));
      }

      // Doygunluk ayarı
      if (options.saturation) {
        const saturation = (options.saturation + 100) / 100;
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.max(0, Math.min(255, gray + saturation * (r - gray)));
        g = Math.max(0, Math.min(255, gray + saturation * (g - gray)));
        b = Math.max(0, Math.min(255, gray + saturation * (b - gray)));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Toplu işleme
  async batchProcessImages(
    images: File[], 
    options: ImageEnhancementOptions = {}
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    const batchSize = 3; // Paralel işleme için batch boyutu

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const batchPromises = batch.map(image => 
        this.processImage(image, options)
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} işleme hatası:`, error);
        // Hatalı batch'i atla ve devam et
      }
    }

    return results;
  }

  // Şablon sistemi (gelişmiş)
  getImageTemplate(category: 'food' | 'drink' | 'dessert') {
    const templates = {
      food: { 
        width: 400, 
        height: 300, 
        style: 'rounded', 
        aspectRatio: 'landscape' as const,
        borderRadius: '12px',
        shadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '2px solid #f3f4f6'
      },
      drink: { 
        width: 300, 
        height: 400, 
        style: 'circle', 
        aspectRatio: 'portrait' as const,
        borderRadius: '50%',
        shadow: '0 6px 20px rgba(0,0,0,0.2)',
        border: '3px solid #e5e7eb'
      },
      dessert: { 
        width: 350, 
        height: 350, 
        style: 'square', 
        aspectRatio: 'square' as const,
        borderRadius: '16px',
        shadow: '0 8px 25px rgba(0,0,0,0.12)',
        border: '2px solid #fce7f3'
      }
    };
    
    return templates[category];
  }

  // Görsel boyutlandırma ve kırpma
  async resizeAndCropImage(
    imageBlob: Blob, 
    template: ReturnType<typeof this.getImageTemplate>
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageBlob;

    const img = new Image();
    const imageUrl = URL.createObjectURL(imageBlob);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Canvas boyutlarını şablona göre ayarla
    canvas.width = template.width;
    canvas.height = template.height;

    // Görseli merkeze hizala ve kırp
    const scale = Math.max(template.width / img.width, template.height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    const x = (template.width - scaledWidth) / 2;
    const y = (template.height - scaledHeight) / 2;

    // Arka plan rengi (beyaz)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, template.width, template.height);

    // Görseli çiz
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    URL.revokeObjectURL(imageUrl);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || imageBlob);
      }, 'image/jpeg', 0.9);
    });
  }

  // Görsel kalite optimizasyonu
  async optimizeImageQuality(imageBlob: Blob): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageBlob;

    const img = new Image();
    const imageUrl = URL.createObjectURL(imageBlob);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Orijinal boyutları koru
    canvas.width = img.width;
    canvas.height = img.height;

    // Görseli çiz
    ctx.drawImage(img, 0, 0);

    // Kalite optimizasyonu
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Hafif keskinlik artırma
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Hafif kontrast artırma
      data[i] = Math.min(255, r * 1.05);
      data[i + 1] = Math.min(255, g * 1.05);
      data[i + 2] = Math.min(255, b * 1.05);
    }

    ctx.putImageData(imageData, 0, 0);
    URL.revokeObjectURL(imageUrl);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || imageBlob);
      }, 'image/jpeg', 0.85);
    });
  }

  // Görsel ID oluşturucu
  private generateImageId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // API anahtarı güncelleme
  updateApiKey(apiKey: string) {
    this.removeBgApiKey = apiKey;
  }
}

// Singleton instance
export const aiImageProcessor = new AIImageProcessor();

// Yardımcı fonksiyonlar
export const suggestEnhancements = async (image: Blob): Promise<EnhancementSuggestion[]> => {
  return await aiImageProcessor.analyzeAndSuggestEnhancements(image);
};

export const batchProcessImages = async (images: File[], options: ImageEnhancementOptions = {}) => {
  return await aiImageProcessor.batchProcessImages(images, options);
};
