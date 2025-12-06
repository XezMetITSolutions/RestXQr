const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ImageUploadResult {
  success: boolean;
  data?: {
    filename: string;
    originalName: string;
    size: number;
    imageUrl: string;
  };
  message?: string;
}

export const uploadImage = async (file: File): Promise<ImageUploadResult> => {
  try {
    // FormData oluştur
    const formData = new FormData();
    formData.append('image', file);

    // API'ye gönder
    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        message: result.message || 'Resim yüklenemedi'
      };
    }

  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.createElement('img');
    
    img.onload = () => {
      try {
        // Boyutları hesapla
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Resmi çiz
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Sıkıştırılmış resmi al
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Resim yüklenemedi'));
    };
    
    // FileReader ile dosyayı oku
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };
    reader.readAsDataURL(file);
  });
};
