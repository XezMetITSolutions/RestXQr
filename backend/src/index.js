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

// CORS configuration - Allow specific origins for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin === 'http://localhost:3000') return callback(null, true);
    
    // Get base domain from environment or use default
    const baseDomain = process.env.BASE_DOMAIN || 'restxqr.com';
    
    // Allow main domain
    if (origin === `https://${baseDomain}` || origin === `https://www.${baseDomain}`) {
      return callback(null, true);
    }
    
    // Allow all subdomains of base domain
    const domainPattern = new RegExp(`^https://[a-zA-Z0-9-]+\\.${baseDomain.replace(/\./g, '\\.')}$`);
    if (origin.match(domainPattern)) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.match(/^https?:\/\/localhost(:\d+)?$/) || origin.match(/^https?:\/\/127\.0\.0\.1(:\d+)?$/)) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Subdomain', 'X-Forwarded-Host'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static dosya servisi (uploads klasörü için)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
// File upload routes - Gerçek dosya yükleme sistemi
const multer = require('multer');
const sharp = require('sharp');

// Upload klasörünü oluştur
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
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

// Static dosya servisi (uploads klasörü için) - tekrar tanımlama (yukarıda zaten var ama burada da tutuyoruz)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// API path'i için de aynı klasörü servis et (frontend uyumluluğu için)
app.use('/api/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Gerçek upload endpoint
app.post('/api/upload/image', upload.single('image'), async (req, res) => {
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

    // URL oluştur
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


// Recursive dosya arama fonksiyonu
const getAllImageFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Alt klasörleri de tara
      getAllImageFiles(filePath, fileList);
    } else {
      // Sadece resim dosyalarını ekle
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        fileList.push({
          filename: file,
          fullPath: filePath,
          relativePath: filePath.replace(path.join(__dirname, 'public'), '').replace(/\\/g, '/'),
          dir: dir,
          relativeDir: dir.replace(path.join(__dirname, 'public'), '').replace(/\\/g, '/')
        });
      }
    }
  });
  
  return fileList;
};

// Tüm dosyaları listele endpoint'i
app.get('/api/debug/list-files', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    console.log('📁 Tüm dosyalar listeleniyor (recursive)...');

    // Upload klasörünü kontrol et
    const uploadDir = path.join(__dirname, 'public/uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        files: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
        uploadDir: uploadDir,
        message: 'Upload klasörü bulunamadı'
      });
    }

    // Recursive olarak tüm resim dosyalarını bul
    let allFiles = getAllImageFiles(uploadDir);
    
    console.log(`📊 Toplam ${allFiles.length} resim dosyası bulundu`);

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


