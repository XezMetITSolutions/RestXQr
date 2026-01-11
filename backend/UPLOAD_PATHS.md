# Upload Paths Documentation

## Mevcut Durum

### Local Development
- **Upload Klasörü:** `backend/src/public/uploads`
- **Static Serving:** 
  - `/uploads/` → `backend/src/public/uploads`
  - `/api/uploads/` → `backend/src/public/uploads`

### Production (Render.com)
⚠️ **UYARI:** Render.com'da dosyalar geçici olabilir ve restart'ta silinebilir!

## Upload Endpoint
- **POST** `/api/upload/image`
- Dosyalar `backend/src/public/uploads` klasörüne kaydediliyor
- URL formatı: `/uploads/image-{timestamp}-{random}.jpg`

## Sorun
Production'da (Render.com) dosyalar kalıcı değil, restart'ta silinebilir.

## Çözüm Önerileri

### 1. Cloud Storage (Önerilen)
- AWS S3
- Cloudinary
- Google Cloud Storage
- Azure Blob Storage

### 2. Persistent Volume (Render.com)
- Render.com'da persistent disk kullanılabilir
- Ancak bu ekstra maliyet getirir

### 3. External File Service
- CDN kullanımı
- Image hosting servisleri

## Mevcut Dosyaların Yeri
Eğer production'da dosyalar varsa, muhtemelen:
- Render.com'un geçici dosya sisteminde
- Restart sonrası silinmiş olabilir
