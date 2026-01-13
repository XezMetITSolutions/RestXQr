const express = require('express');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../lib/cloudinary');
const router = express.Router();

// Multer konfigürasyonu (memory storage - Cloudinary'ye yüklemek için)
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

  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    success: true,
    message: 'Upload route çalışıyor',
    timestamp: new Date().toISOString(),
    storage: 'cloudinary',
    cloudinaryConfigured: cloudinaryConfigured
  });
});

// POST /api/upload/image - Resim yükleme (Cloudinary)
router.post('/image', upload.single('image'), async (req, res) => {
  console.log('📤 Cloudinary Upload endpoint çağrıldı');

  try {
    if (!req.file) {
      console.log('❌ Dosya bulunamadı');
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası bulunamadı'
      });
    }

    console.log('✅ Dosya alındı:', req.file.originalname, req.file.size, 'bytes');

    // Cloudinary yapılandırma kontrolü
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary yapılandırması eksik!');
      return res.status(500).json({
        success: false,
        message: 'Cloudinary yapılandırması eksik. Lütfen environment variables kontrol edin.'
      });
    }

    // Opsiyonel: Alt klasör belirle (örn: restaurant ID'si)
    const folder = req.body.folder || 'products';

    // Cloudinary'ye yükle
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `restxqr/${folder}`,
      public_id: `img_${Date.now()}_${Math.round(Math.random() * 1E9)}`
    });

    console.log('🔗 Cloudinary URL:', result.secure_url);

    res.json({
      success: true,
      data: {
        filename: result.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
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

// DELETE /api/upload/image/:publicId - Resim silme
router.delete('/image/:publicId', async (req, res) => {
  console.log('🗑️ Cloudinary silme endpoint çağrıldı');

  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID gerekli'
      });
    }

    // URL encoded public ID'yi decode et
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await deleteFromCloudinary(decodedPublicId);

    res.json({
      success: true,
      message: 'Resim silindi',
      result: result
    });

  } catch (error) {
    console.error('❌ Resim silme hatası:', error);

    res.status(500).json({
      success: false,
      message: 'Resim silme hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/upload/images - Çoklu resim yükleme
router.post('/images', upload.array('images', 10), async (req, res) => {
  console.log('📤 Çoklu Cloudinary Upload endpoint çağrıldı');

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resim dosyaları bulunamadı'
      });
    }

    console.log(`✅ ${req.files.length} dosya alındı`);

    // Cloudinary yapılandırma kontrolü
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary yapılandırması eksik'
      });
    }

    const folder = req.body.folder || 'products';

    // Tüm resimleri paralel olarak yükle
    const uploadPromises = req.files.map(async (file, index) => {
      const result = await uploadToCloudinary(file.buffer, {
        folder: `restxqr/${folder}`,
        public_id: `img_${Date.now()}_${index}_${Math.round(Math.random() * 1E9)}`
      });

      return {
        originalName: file.originalname,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Çoklu resim yükleme hatası:', error);

    res.status(500).json({
      success: false,
      message: 'Çoklu resim yükleme hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
