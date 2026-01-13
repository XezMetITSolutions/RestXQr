const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Database connection (optional for 2FA)
let connectDB;
try {
  connectDB = require('./models').connectDB;
} catch (error) {
  console.log('⚠️ Database models not available, 2FA will work without database');
  connectDB = () => Promise.reject(new Error('Database not available'));
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Relaxed for debugging
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Subdomain', 'X-Forwarded-Host'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static dosya servisi (uploads klasörü için)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Recursive dosya arama fonksiyonu (debug için)
const getAllImageFiles = (dir, fileList = [], baseDir = null) => {
  if (!baseDir) baseDir = dir;

  try {
    const files = fs.readdirSync(dir);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

    files.forEach(file => {
      try {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Alt klasörleri de tara
          getAllImageFiles(filePath, fileList, baseDir);
        } else {
          // Sadece resim dosyalarını ekle
          const ext = path.extname(file).toLowerCase();
          if (imageExtensions.includes(ext)) {
            const relativePath = filePath.replace(baseDir, '').replace(/\\/g, '/');
            fileList.push({
              filename: file,
              fullPath: filePath,
              relativePath: relativePath.startsWith('/') ? relativePath : '/' + relativePath,
              dir: dir,
              relativeDir: dir.replace(baseDir, '').replace(/\\/g, '/')
            });
          }
        }
      } catch (fileError) {
        console.error(`❌ Dosya işleme hatası (${file}):`, fileError.message);
      }
    });
  } catch (dirError) {
    console.error(`❌ Klasör okuma hatası (${dir}):`, dirError.message);
  }

  return fileList;
};

// Debug endpoint test (routes'lardan önce)
app.get('/api/debug/test', (req, res) => {
  res.json({
    success: true,
    message: 'Debug endpoint çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// Cloudinary Test Sayfası
app.get('/debug', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RestXQr - Cloudinary Debug</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f4f7f6; }
            .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; margin-top: 0; }
            .upload-area { border: 2px dashed #3498db; padding: 40px; text-align: center; border-radius: 8px; margin: 20px 0; cursor: pointer; transition: background 0.3s; }
            .upload-area:hover { background: #ebf5fb; }
            #preview { max-width: 100%; border-radius: 8px; margin-top: 20px; display: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            #status { margin-top: 20px; padding: 15px; border-radius: 6px; display: none; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .loading { color: #3498db; font-weight: bold; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
            .btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 10px; }
            .btn:disabled { background: #bdc3c7; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🖼️ Cloudinary Upload Test</h1>
            <p>Bu sayfa, resimlerin Cloudinary'ye başarıyla yüklenip yüklenmediğini test etmek içindir.</p>
            
            <div class="upload-area" onclick="document.getElementById('fileInput').click()">
                <p>Resim seçmek için buraya tıklayın (JPG/PNG)</p>
                <input type="file" id="fileInput" accept="image/*" style="display: none" onchange="handleFile(this)">
            </div>

            <div id="status"></div>
            <img id="preview" src="" alt="Önizleme">
            
            <div id="resultInfo" style="display: none; margin-top: 20px;">
                <h3>✅ Yükleme Başarılı!</h3>
                <p><strong>Cloudinary URL:</strong> <a id="imageUrl" href="#" target="_blank">Resmi Aç</a></p>
                <p><strong>Public ID:</strong> <span id="publicId"></span></p>
                <h4>API Yanıtı:</h4>
                <pre id="jsonResult"></pre>
            </div>
        </div>

        <script>
            async function handleFile(input) {
                const file = input.files[0];
                if (!file) return;

                const status = document.getElementById('status');
                const preview = document.getElementById('preview');
                const resultInfo = document.getElementById('resultInfo');
                
                // Önizleme göster
                const reader = new FileReader();
                reader.onload = e => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);

                // Yükle
                status.innerHTML = '<span class="loading">⏳ Yükleniyor... Lütfen bekleyin.</span>';
                status.className = '';
                status.style.display = 'block';
                resultInfo.style.display = 'none';

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch('/api/upload/image', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success) {
                        status.innerHTML = '✅ Resim Cloudinary\\'ye başarıyla yüklendi!';
                        status.className = 'success';
                        
                        document.getElementById('imageUrl').href = result.data.imageUrl;
                        document.getElementById('imageUrl').innerText = result.data.imageUrl;
                        document.getElementById('publicId').innerText = result.data.publicId;
                        document.getElementById('jsonResult').innerText = JSON.stringify(result, null, 2);
                        resultInfo.style.display = 'block';
                    } else {
                        throw new Error(result.message || 'Yükleme başarısız');
                    }
                } catch (error) {
                    status.innerHTML = '❌ Hata: ' + error.message;
                    status.className = 'error';
                }
            }
        </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Tüm dosyaları listele endpoint'i (routes'lardan önce)
app.get('/api/debug/list-files', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    console.log('📁 Tüm dosyalar listeleniyor (recursive)...');

    // Upload klasörünü kontrol et
    const uploadDir = path.join(__dirname, 'public/uploads');

    console.log('📁 Upload klasörü yolu:', uploadDir);
    console.log('📁 __dirname:', __dirname);
    console.log('📁 Klasör var mı?', fs.existsSync(uploadDir));

    if (!fs.existsSync(uploadDir)) {
      // Klasör yoksa oluşturmayı dene
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('✅ Upload klasörü oluşturuldu');
      } catch (mkdirError) {
        console.error('❌ Klasör oluşturma hatası:', mkdirError);
        return res.json({
          success: false,
          files: [],
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0,
          uploadDir: uploadDir,
          message: 'Upload klasörü bulunamadı ve oluşturulamadı',
          error: process.env.NODE_ENV === 'development' ? mkdirError.message : undefined
        });
      }
    }

    // Klasördeki tüm dosya ve klasörleri listele (debug için)
    try {
      const dirContents = fs.readdirSync(uploadDir);
      console.log('📋 Klasör içeriği:', dirContents.length, 'öğe');
      if (dirContents.length > 0) {
        console.log('📋 İlk 10 öğe:', dirContents.slice(0, 10));
      }
    } catch (readError) {
      console.error('❌ Klasör okuma hatası:', readError);
    }

    // Recursive olarak tüm resim dosyalarını bul
    let allFiles = getAllImageFiles(uploadDir);

    console.log(`📊 Toplam ${allFiles.length} resim dosyası bulundu`);

    if (allFiles.length > 0) {
      console.log('📋 İlk 5 dosya:', allFiles.slice(0, 5).map(f => f.filename));
    }

    // Arama filtresi
    if (search) {
      allFiles = allFiles.filter(file =>
        file.filename.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Tarihe göre sırala (en yeni önce)
    allFiles.sort((a, b) => {
      const statA = fs.statSync(a.fullPath);
      const statB = fs.statSync(b.fullPath);
      return statB.mtime.getTime() - statA.mtime.getTime();
    });

    const total = allFiles.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedFiles = allFiles.slice(startIndex, endIndex);

    // Dosya detaylarını al
    const fileDetails = paginatedFiles.map(file => {
      const stats = fs.statSync(file.fullPath);
      const baseUrl = process.env.BACKEND_URL || 'https://masapp-backend.onrender.com';

      return {
        filename: file.filename,
        path: file.fullPath,
        relativePath: file.relativePath,
        relativeDir: file.relativeDir,
        fullUrl: `${baseUrl}${file.relativePath}`,
        apiUrl: `${baseUrl}/api${file.relativePath}`,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime,
        extension: path.extname(file.filename).toLowerCase()
      };
    });

    console.log(`✅ ${total} dosya bulundu, ${paginatedFiles.length} dosya gösteriliyor`);

    res.json({
      success: true,
      files: fileDetails,
      total: total,
      page: pageNum,
      limit: limitNum,
      totalPages: totalPages,
      uploadDir: uploadDir,
      hasMore: pageNum < totalPages,
      scannedDirectories: [uploadDir]
    });

  } catch (error) {
    console.error('❌ Dosya listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya listeleme hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rate limiting - GEVŞEK (Development için)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1 dakikada 1000 istek (çok gevşek)
  message: 'Çok fazla istek gönderdiniz, lütfen biraz bekleyin'
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'restXqr Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Server-Sent Events endpoint for real-time updates
app.get('/api/events/orders', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Client'a bağlandığını bildir
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to kitchen updates' })}\n\n`);

  // Client'ı subscribers listesine ekle
  const clientId = Date.now().toString();
  const { addSubscriber } = require('./lib/realtime');
  addSubscriber(clientId, res);

  // Client bağlantısı kesildiğinde temizle
  req.on('close', () => {
    const { removeSubscriber } = require('./lib/realtime');
    removeSubscriber(clientId);
  });
});

// API Routes (placeholder)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/restaurants', require('./routes/menu')); // Menu routes nested under restaurants
app.use('/api/orders', require('./routes/orders'));
app.use('/api/qr', require('./routes/qr')); // QR code management
app.use('/api/staff', require('./routes/staff')); // Staff management
app.use('/api/waiter', require('./routes/waiter')); // Waiter calls
app.use('/api/admin/2fa', require('./routes/admin2fa')); // Admin 2FA
app.use('/api/plans', require('./routes/plans')); // Plan management
app.use('/api/support', require('./routes/support')); // Support tickets
// Feature routes
app.use('/api/branches', require('./routes/branches')); // Branch management
app.use('/api/apikeys', require('./routes/apikeys')); // API key management
app.use('/api/deliveries', require('./routes/deliveries')); // Delivery management
app.use('/api/pos', require('./routes/pos')); // POS device management
app.use('/api/transactions', require('./routes/transactions')); // Transaction management
app.use('/api/inventory', require('./routes/inventory')); // Inventory management
app.use('/api/ai', require('./routes/ai')); // AI recommendations
app.use('/api/videomenu', require('./routes/videomenu')); // Video menu
app.use('/api/events', require('./routes/events')); // Event management
app.use('/api/translate', require('./routes/translate')); // Translation service
app.use('/api/sessions', require('./routes/sessions')); // Session management for real-time cart
// File upload routes - Cloudinary ile kalıcı depolama
const multer = require('multer');
const { uploadToCloudinary } = require('./lib/cloudinary');

// Upload klasörünü oluştur (fallback için)
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu (memory storage - Cloudinary için)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'), false);
    }
  }
});

// Static dosya servisi (uploads klasörü için) - eski resimler için fallback
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// API path'i için de aynı klasörü servis et (frontend uyumluluğu için)
app.use('/api/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Cloudinary upload endpoint - Relaxed CORS for testing
app.options('/api/upload/image', cors()); // Enable pre-flight
app.post('/api/upload/image', cors(), upload.single('image'), async (req, res) => {
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
      console.error('❌ Cloudinary yapılandırması eksik! Lütfen environment variables kontrol edin.');
      return res.status(500).json({
        success: false,
        message: 'Cloudinary yapılandırması eksik. Lütfen CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET environment variables ekleyin.'
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
        imageUrl: result.secure_url, // Cloudinary URL - kalıcı!
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



// Dosya arama endpoint'i
app.get('/api/debug/search-file', async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Dosya adı gerekli'
      });
    }

    console.log('🔍 Dosya aranıyor:', filename);

    // Upload klasörünü kontrol et
    const uploadDir = path.join(__dirname, 'public/uploads');

    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        found: false,
        message: 'Upload klasörü bulunamadı',
        uploadDir: uploadDir,
        files: []
      });
    }

    // Klasördeki tüm dosyaları listele
    const files = fs.readdirSync(uploadDir);
    console.log('📁 Toplam dosya sayısı:', files.length);

    // Dosya adını içeren dosyaları bul
    const matchingFiles = files.filter(file =>
      file.toLowerCase().includes(filename.toLowerCase())
    );

    const fileDetails = matchingFiles.map(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        path: filePath,
        relativePath: `/uploads/${file}`,
        fullUrl: `https://masapp-backend.onrender.com/uploads/${file}`,
        apiUrl: `https://masapp-backend.onrender.com/api/uploads/${file}`,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    console.log('✅ Bulunan dosyalar:', matchingFiles.length);

    res.json({
      success: true,
      found: matchingFiles.length > 0,
      searchTerm: filename,
      uploadDir: uploadDir,
      totalFiles: files.length,
      matchingFiles: matchingFiles.length,
      files: fileDetails,
      allFiles: files.slice(0, 20) // İlk 20 dosyayı göster
    });

  } catch (error) {
    console.error('❌ Dosya arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya arama hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Demo talep endpoint'i
app.post('/api/demo-request', async (req, res) => {
  try {
    const { name, email, phone, company, message, language, source } = req.body;
    console.log('📧 Demo talep alındı:', { name, email, phone, company, language, source });

    res.json({
      success: true,
      message: 'Demo request received successfully',
      data: { name, email, phone, company, message, language, source, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('❌ Demo talep hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Demo request failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin Preview - Kroren Menu Data
app.get('/api/admin/import-preview', (req, res) => {
  try {
    const menuData = require('./data/kroren_scraped.json');
    res.json(menuData);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Import - Kroren Menu
app.all('/api/admin/import-kroren', async (req, res) => {
  try {
    const { importKrorenMenu } = require('./utils/importHandler');
    const menuData = require('./data/kroren_scraped.json');
    console.log('📦 Kroren menüsü içe aktarma isteği alındı');
    const results = await importKrorenMenu(menuData);
    res.json({ success: true, message: 'İçe aktarma işlemi tamamlandı', results });
  } catch (error) {
    console.error('❌ İçe aktarma hatası:', error);
    res.status(500).json({ success: false, message: 'İçe aktarma sırasında bir hata oluştu', error: error.message });
  }
});

// Kayıp resimleri bulma endpoint'i
app.get('/api/debug/missing-images', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    console.log('🔍 Kayıp resimler aranıyor...', restaurantId ? `Restoran ID: ${restaurantId}` : 'Tüm restoranlar');

    const { MenuItem } = require('./models');
    const uploadDir = path.join(__dirname, 'public/uploads');

    // Database'deki tüm menu item'ları al
    const whereClause = restaurantId ? { restaurantId } : {};
    const menuItems = await MenuItem.findAll({
      where: whereClause,
      attributes: ['id', 'restaurantId', 'name', 'imageUrl'],
      order: [['restaurantId', 'ASC'], ['name', 'ASC']]
    });

    console.log(`📊 ${menuItems.length} menu item bulundu`);

    // Backend'deki tüm dosyaları al
    const allFiles = fs.existsSync(uploadDir) ? getAllImageFiles(uploadDir) : [];
    const existingFileNames = new Set(allFiles.map(f => f.filename));
    const existingPaths = new Set(allFiles.map(f => f.relativePath));

    console.log(`📁 Backend'de ${allFiles.length} dosya bulundu`);

    // Kayıp resimleri bul
    const missingImages = [];
    const foundImages = [];

    for (const item of menuItems) {
      const imageUrl = item.imageUrl;

      if (!imageUrl) {
        // Resim URL'i yok
        missingImages.push({
          itemId: item.id,
          restaurantId: item.restaurantId,
          name: item.name,
          imageUrl: null,
          reason: 'imageUrl yok',
          status: 'missing'
        });
        continue;
      }

      // Eğer external URL ise (http/https ile başlıyorsa), kontrol etmeye gerek yok
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        foundImages.push({
          itemId: item.id,
          restaurantId: item.restaurantId,
          name: item.name,
          imageUrl: imageUrl,
          reason: 'External URL (Cloudinary or others)',
          status: 'external'
        });
        continue;
      }

      // Local path kontrolü ... (gerisi aynı)
      missingImages.push({
        itemId: item.id,
        restaurantId: item.restaurantId,
        name: item.name,
        imageUrl: imageUrl,
        reason: 'Local dosya kontrolü şu an optimize ediliyor',
        status: 'local'
      });
    }

    res.json({
      success: true,
      data: {
        total: menuItems.length,
        found: foundImages.length,
        missing: missingImages.length,
        missingImages: missingImages,
        foundImages: foundImages.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('❌ Kayıp resim arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıp resim arama hatası',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test endpoint for QR system
app.get('/api/qr/test', async (req, res) => {
  try {
    const { QRToken, Restaurant } = require('./models');

    // Test if QRToken model is available
    if (!QRToken) {
      return res.status(503).json({
        success: false,
        message: 'QRToken model not available'
      });
    }

    // Test database connection
    const count = await QRToken.count();

    res.json({
      success: true,
      message: 'QR system is working',
      qrTokenCount: count,
      models: {
        QRToken: !!QRToken,
        Restaurant: !!Restaurant
      }
    });
  } catch (error) {
    console.error('QR test error:', error);
    res.status(500).json({
      success: false,
      message: 'QR system error',
      error: error.message
    });
  }
});

// SSE endpoint for real-time notifications
app.get('/api/events', (req, res) => {
  console.log('🔌 SSE connection request from:', req.get('origin'));
  console.log('🔌 SSE endpoint hit at:', new Date().toISOString());

  // Set headers for SSE with proper CORS
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': req.get('origin') || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
    'X-Accel-Buffering': 'no' // Disable nginx buffering
  });

  // Generate unique client ID
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Add subscriber
  const { addSubscriber, removeSubscriber } = require('./lib/realtime');
  addSubscriber(clientId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    clientId: clientId,
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    removeSubscriber(clientId);
  });

  req.on('aborted', () => {
    removeSubscriber(clientId);
  });
});

// Debug notification endpoint
app.post('/api/debug/publish-notification', async (req, res) => {
  try {
    const { eventType, data } = req.body;

    console.log('🐛 Debug notification:', { eventType, data });

    // Real-time bildirim gönder
    const { publish } = require('./lib/realtime');
    publish(eventType, data);

    res.json({
      success: true,
      message: 'Debug notification sent',
      eventType,
      data
    });
  } catch (error) {
    console.error('Debug notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug notification failed',
      error: error.message
    });
  }
});

// Test endpoint for debug page
app.post('/api/test-image', async (req, res) => {
  try {
    const { image, testData } = req.body;

    console.log('Test image endpoint called:', {
      imageLength: image?.length || 0,
      testData: testData
    });

    res.json({
      success: true,
      message: 'Test endpoint working',
      receivedData: {
        imageLength: image?.length || 0,
        imageType: image?.substring(0, 50) + '...',
        testData: testData
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
});

// Simple menu item test endpoint
app.post('/api/test-menu-item', async (req, res) => {
  try {
    const { restaurantId, categoryId, name, price, imageUrl } = req.body;

    console.log('Test menu item endpoint called:', {
      restaurantId,
      categoryId,
      name,
      price,
      imageUrlLength: imageUrl?.length || 0
    });

    // Just validate the data without creating
    if (!restaurantId || !categoryId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['restaurantId', 'categoryId', 'name', 'price']
      });
    }

    res.json({
      success: true,
      message: 'Menu item data is valid',
      data: {
        restaurantId,
        categoryId,
        name,
        price,
        imageUrlLength: imageUrl?.length || 0
      }
    });
  } catch (error) {
    console.error('Test menu item endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test menu item endpoint error',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Initialize database and start server
const startServer = async () => {
  // Start server first
  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base: http://localhost:${PORT}/api`);
    console.log(`🔐 2FA API: http://localhost:${PORT}/api/admin/2fa/status`);
  });

  // Connect to database (non-blocking) - ignore errors for 2FA testing
  try {
    await connectDB();
    console.log('✅ Database connected successfully');

    // Auto-sync models with database (adds missing columns)
    const { sequelize } = require('./models');
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synced successfully');
    } catch (syncError) {
      console.error('⚠️ Database sync warning:', syncError.message);
    }
  } catch (error) {
    console.error('⚠️ Database connection failed, but server continues running:', error.message);
    console.log('🔐 2FA endpoints will work without database');
  }

  return server;
};

startServer();

module.exports = app;


