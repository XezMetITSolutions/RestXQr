const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const router = express.Router();

// Upload klasörünü oluştur (public klasöründe)
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu (memory storage)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'), false);
    }
  }
});

// GET /api/upload/test - Test endpoint
router.get('/test', (req, res) => {
  console.log('🔍 Upload test endpoint çağrıldı');
  res.json({
    success: true,
    message: 'Upload route çalışıyor',
    timestamp: new Date().toISOString(),
    uploadDir: uploadDir,
    uploadDirExists: fs.existsSync(uploadDir)
  });
});

// POST /api/upload/image - Resim yükleme
router.post('/image', upload.single('image'), async (req, res) => {
  console.log('📤 Upload endpoint çağrıldı');
  
  try {
    if (!req.file) {
      console.log('❌ Dosya bulunamadı');
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası bulunamadı'
      });
    }

    console.log('✅ Dosya alındı:', req.file.originalname, req.file.size, 'bytes');

    // Dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `image-${uniqueSuffix}.jpg`;
    const filePath = path.join(uploadDir, filename);

    console.log('📁 Dosya yolu:', filePath);

    // Sharp ile resmi optimize et ve kaydet
    try {
      await sharp(req.file.buffer)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      console.log('✅ Resim Sharp ile işlendi ve kaydedildi');
    } catch (sharpError) {
      console.error('❌ Sharp hatası:', sharpError);
      
      // Sharp çalışmazsa basit dosya kaydetme
      console.log('🔄 Sharp çalışmadı, basit dosya kaydediliyor...');
      fs.writeFileSync(filePath, req.file.buffer);
      console.log('✅ Resim basit yöntemle kaydedildi');
    }

    // URL oluştur (public klasöründen)
    const imageUrl = `/uploads/${filename}`;

    console.log('🔗 URL oluşturuldu:', imageUrl);

    res.json({
      success: true,
      data: {
        filename: filename,
        originalName: req.file.originalname,
        size: req.file.size,
        imageUrl: imageUrl
      }
    });

  } catch (error) {
    console.error('❌ Resim yükleme hatası:', error);
    
    res.status(500).json({
      success: false,
      message: 'Resim yükleme hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
