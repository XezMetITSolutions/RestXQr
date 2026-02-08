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

// CORS configuration - Allow all origins including custom domains
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow all origins for now (can be restricted later)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Subdomain', 'X-Forwarded-Host'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

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

// FONT BOYUTU TEST YAZDIRMA
app.post('/api/debug/print-font-test', async (req, res) => {
  try {
    const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
    const { printerIP, printerPort, fontConfig, sizeName, sizeDescription } = req.body;

    if (!printerIP) {
      return res.status(400).json({ success: false, error: 'Yazıcı IP adresi gerekli' });
    }

    console.log(`🖨️ Font Test: ${sizeName} - IP: ${printerIP}:${printerPort}`);

    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${printerIP}:${printerPort || 9100}`,
      characterSet: CharacterSet.PC857_TURKISH,
      removeSpecialCharacters: false,
      lineCharacter: '-',
      options: { timeout: 5000 }
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      return res.status(400).json({ success: false, error: 'Yazıcıya bağlanılamadı' });
    }

    // Başlık
    printer.alignCenter();
    printer.bold(true);
    printer.println('=== FONT BOYUTU TEST ===');
    printer.bold(false);
    printer.println(`Boyut: ${sizeName}`);
    printer.println(`Ayar: ${sizeDescription}`);
    printer.drawLine();
    printer.newLine();

    // Masa numarası (Ana test alanı)
    printer.alignCenter();

    if (fontConfig.bold) printer.bold(true);
    if (fontConfig.doubleHeight) printer.setTextDoubleHeight();
    if (fontConfig.doubleWidth) printer.setTextDoubleWidth();

    printer.println('MASA: 5');

    printer.setTextNormal();
    printer.bold(false);

    // İstasyon adı
    if (fontConfig.bold) printer.bold(true);
    printer.println('[ MUTFAK ]');
    printer.bold(false);
    printer.drawLine();
    printer.newLine();

    // Tarih
    printer.alignLeft();
    printer.println(`Tarih: ${new Date().toLocaleString('tr-TR')}`);
    printer.drawLine();
    printer.newLine();

    // Sipariş detayı başlığı
    printer.bold(true);
    printer.println('SIPARIS DETAYI:');
    printer.bold(false);
    printer.newLine();

    // Ürünler
    const testItems = [
      { quantity: 2, name: 'Adana Kebap', variations: 'Az acili, Buyuk porsiyon', notes: 'Acisiz olsun' },
      { quantity: 1, name: 'Lahmacun', variations: null, notes: null },
      { quantity: 3, name: 'Ayran', variations: null, notes: null }
    ];

    for (const item of testItems) {
      if (fontConfig.bold) printer.bold(true);
      printer.println(`${item.quantity}x ${item.name}`);
      printer.bold(false);

      if (item.variations) {
        printer.println(`   > ${item.variations}`);
      }
      if (item.notes) {
        printer.bold(true);
        printer.println(`   !! NOT: ${item.notes}`);
        printer.bold(false);
      }
      printer.newLine();
    }

    printer.drawLine();
    printer.newLine();
    printer.alignCenter();
    printer.bold(true);
    printer.println('AFIYET OLSUN!');
    printer.bold(false);
    printer.newLine();

    // Font bilgisi
    printer.println('---');
    printer.println(`[${sizeName}]`);
    printer.println(`doubleH: ${fontConfig.doubleHeight ? 'EVET' : 'HAYIR'}`);
    printer.println(`doubleW: ${fontConfig.doubleWidth ? 'EVET' : 'HAYIR'}`);
    printer.println(`bold: ${fontConfig.bold ? 'EVET' : 'HAYIR'}`);

    printer.newLine();
    printer.newLine();
    printer.cut();

    await printer.execute();

    console.log(`✅ Font test yazdırma başarılı: ${sizeName}`);
    res.json({ success: true, message: `${sizeName} yazdırıldı` });

  } catch (error) {
    console.error('❌ Font test yazdırma hatası:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// VERİTABANI ŞEMASINI GÜNCELLE (Add approved column)
app.post('/api/debug/sync-db', async (req, res) => {
  console.log('🔧 Database sync endpoint called');
  try {
    const { sequelize } = require('./models');
    console.log('⚙️  Adding approved column to orders table...');

    // Check if column exists first
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='approved';
    `);

    if (results.length > 0) {
      console.log('✅ approved column already exists');
      return res.json({
        success: true,
        message: 'approved kolonu zaten mevcut. Güncelleme gerekmedi.',
        timestamp: new Date().toISOString(),
        alreadyExists: true
      });
    }

    // Add the column
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN approved BOOLEAN DEFAULT false;
    `);

    // Update existing orders
    await sequelize.query(`
      UPDATE orders 
      SET approved = false 
      WHERE approved IS NULL;
    `);

    console.log('✅ approved column added successfully');
    res.json({
      success: true,
      message: 'approved kolonu başarıyla eklendi! Tüm mevcut siparişler approved=false olarak ayarlandı.',
      timestamp: new Date().toISOString(),
      details: 'Column added with DEFAULT false'
    });
  } catch (error) {
    console.error('❌ DB Sync Error:', error);
    res.status(500).json({
      success: false,
      message: 'Veritabanı senkronizasyonu başarısız oldu',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// KROREN YAZICI YAPILANDIRMASINI GÜNCELLE
app.get('/api/debug/update-kroren-printers', async (req, res) => {
  console.log('🔧 Update Kroren/Levent printers endpoint called');
  try {
    const { Restaurant } = require('./models');
    const results = [];

    // 1. KROREN (ANA MERKEZ)
    const kroren = await Restaurant.findOne({ where: { username: 'kroren' } });
    if (kroren) {
      const krorenConfig = {
        kavurma: { name: 'KAVURMA', ip: '192.168.10.194', port: 9100, enabled: true, type: 'epson', language: 'tr' },
        ramen: { name: 'RAMEN', ip: '192.168.10.197', port: 9100, enabled: true, type: 'epson', language: 'tr' },
        manti: { name: 'MANTI', ip: '192.168.10.199', port: 9100, enabled: true, type: 'epson', language: 'tr' },
        icecek1: { name: 'İÇECEK 1', ip: '192.168.10.192', port: 9100, enabled: true, type: 'epson', language: 'tr' },
        icecek2: { name: 'İÇECEK 2', ip: '192.168.10.191', port: 9100, enabled: true, type: 'epson', language: 'tr' },
        kasa: { name: 'KASA', ip: '192.168.10.198', port: 9100, enabled: true, type: 'epson', language: 'tr' },
        kebap: { name: 'KEBAP', ip: '192.168.10.195', port: 9100, enabled: true, type: 'epson', language: 'tr' }
      };
      const krorenStations = [
        { id: 'kavurma', name: 'KAVURMA', emoji: '🥩', color: '#ef4444', order: 1 },
        { id: 'ramen', name: 'RAMEN', emoji: '🍜', color: '#f97316', order: 2 },
        { id: 'manti', name: 'MANTI', emoji: '🥟', color: '#f59e0b', order: 3 },
        { id: 'icecek1', name: 'İÇECEK 1', emoji: '🥤', color: '#3b82f6', order: 4 },
        { id: 'icecek2', name: 'İÇECEK 2', emoji: '🥤', color: '#0ea5e9', order: 5 },
        { id: 'kasa', name: 'KASA', emoji: '💰', color: '#10b981', order: 6 },
        { id: 'kebap', name: 'KEBAP', emoji: '🍢', color: '#8b5cf6', order: 7 }
      ];
      await Restaurant.update(
        { printerConfig: krorenConfig, kitchenStations: krorenStations },
        { where: { id: kroren.id } }
      );
      results.push('✅ kroren (Merkez) güncellendi (Kavurma, Ramen, Manti, İçecek 1, İçecek 2, Kasa, Kebap)');
    }

    // 2. KROREN-LEVENT
    const levent = await Restaurant.findOne({ where: { username: 'kroren-levent' } });
    if (!levent) {
      // Try reverse username just in case
      const leventAlt = await Restaurant.findOne({ where: { username: 'levent-kroren' } });
      if (leventAlt) {
        levent = leventAlt;
      }
    }

    if (levent) {
      const leventConfig = {
        'kasa': { name: 'KASA', ip: '192.168.1.10', port: 9100, enabled: true, type: 'epson', language: 'tr' },
        'ramen': { name: 'RAMEN', ip: '192.168.1.151', port: 9100, enabled: true, type: 'epson', language: 'zh' },
        'kavurma': { name: 'KAVURMA', ip: '192.168.1.150', port: 9100, enabled: true, type: 'epson', language: 'tr' },
        'kebap': { name: 'KEBAP & SUSHI', ip: '192.168.1.149', port: 9100, enabled: true, type: 'epson', language: 'tr' }
      };

      const leventStations = [
        { id: 'kasa', name: 'KASA', emoji: '💰', color: '#10b981', order: 1 },
        { id: 'ramen', name: 'RAMEN', emoji: '🍜', color: '#ef4444', order: 2 },
        { id: 'kavurma', name: 'KAVURMA', emoji: '🥩', color: '#f59e0b', order: 3 },
        { id: 'kebap', name: 'KEBAP & SUSHI', emoji: '🍱', color: '#8b5cf6', order: 4 }
      ];

      await Restaurant.update(
        { printerConfig: leventConfig, kitchenStations: leventStations },
        { where: { id: levent.id } }
      );

      results.push(`✅ ${levent.username} güncellendi (Kasa, Ramen, Kavurma, Kebap & Sushi)`);
    }

    res.json({
      success: true,
      message: 'Restoran yapılandırmaları tamamlandı',
      details: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Update Printers Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// VERİTABANI ŞEMASINI GÜNCELLE (Add kitchen_station column to menu_items)
app.post('/api/debug/add-kitchen-station', async (req, res) => {
  console.log('🔧 Add kitchen_station column endpoint called');
  try {
    const { sequelize } = require('./models');
    console.log('⚙️  Adding kitchen_station column to menu_items table...');

    // Check if column exists first
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='menu_items' AND column_name='kitchen_station';
    `);

    if (results.length > 0) {
      console.log('✅ kitchen_station column already exists');
      return res.json({
        success: true,
        message: 'kitchen_station kolonu zaten mevcut. Güncelleme gerekmedi.',
        timestamp: new Date().toISOString(),
        alreadyExists: true
      });
    }

    // Add the column
    await sequelize.query(`
      ALTER TABLE menu_items 
      ADD COLUMN kitchen_station VARCHAR(50) NULL;
    `);

    console.log('✅ kitchen_station column added successfully');
    res.json({
      success: true,
      message: 'kitchen_station kolonu başarıyla eklendi! Artık ürünlere istasyon atayabilirsiniz.',
      timestamp: new Date().toISOString(),
      details: 'Column added with VARCHAR(50) NULL'
    });
  } catch (error) {
    console.error('❌ Add kitchen_station Error:', error);
    res.status(500).json({
      success: false,
      message: 'kitchen_station kolonu eklenirken hata oluştu',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// VERİTABANI ŞEMASINI GÜNCELLE (Comprehensive Fix)
app.get('/api/debug/fix-restaurants-schema', async (req, res) => {
  console.log('🔧 Fix restaurants schema endpoint called');
  try {
    const { sequelize } = require('./models');

    // 1. Check and add kitchen_stations
    console.log('⚙️ Checking kitchen_stations...');
    const [ksResult] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='restaurants' AND column_name='kitchen_stations'");
    if (ksResult.length === 0) {
      await sequelize.query("ALTER TABLE restaurants ADD COLUMN kitchen_stations JSONB NULL");
      console.log('✅ Added kitchen_stations');
    }

    // 2. Check and add printer_config
    console.log('⚙️ Checking printer_config...');
    const [pcResult] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='restaurants' AND column_name='printer_config'");
    if (pcResult.length === 0) {
      await sequelize.query("ALTER TABLE restaurants ADD COLUMN printer_config JSONB DEFAULT '{}'::jsonb");
      console.log('✅ Added printer_config');
    }

    // 3. Check and add settings (if missing)
    console.log('⚙️ Checking settings...');
    const [sResult] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='restaurants' AND column_name='settings'");
    if (sResult.length === 0) {
      await sequelize.query("ALTER TABLE restaurants ADD COLUMN settings JSONB DEFAULT '{}'::jsonb");
      console.log('✅ Added settings');
    }

    // 4. Check and add created_at / updated_at if missing
    console.log('⚙️ Checking timestamps...');
    const [tsResult] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='restaurants' AND column_name='created_at'");
    if (tsResult.length === 0) {
      await sequelize.query("ALTER TABLE restaurants ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()");
      await sequelize.query("ALTER TABLE restaurants ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()");
      console.log('✅ Added timestamps');
    }

    console.log('✅ Schema check complete');

    res.json({
      success: true,
      message: 'Restaurants table schema checked and fixed (kitchen_stations, printer_config, settings, timestamps)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Schema Fix Error:', error);
    res.status(500).json({
      success: false,
      message: 'Schema fix failed',
      error: error.message
    });
  }
});

// TEST ENDPOINT
app.get('/api/debug/ping', (req, res) => res.send('pong'));

// ADD DISCOUNT COLUMNS MIGRATION
app.get('/api/debug/add-discount-columns', async (req, res) => {
  console.log('🔧 Add discount columns migration endpoint called');
  try {
    const { sequelize } = require('./models');
    const results = [];

    // Check and add columns to menu_items
    console.log('⚙️ Checking menu_items table...');
    const [itemColumns] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='menu_items' AND column_name IN ('discounted_price', 'discount_percentage', 'discount_start_date', 'discount_end_date');
    `);

    if (!itemColumns.find(c => c.column_name === 'discounted_price')) {
      await sequelize.query(`ALTER TABLE menu_items ADD COLUMN discounted_price DECIMAL(10,2) NULL`);
      results.push('✅ Added discounted_price to menu_items');
      console.log('✅ Added discounted_price');
    }

    if (!itemColumns.find(c => c.column_name === 'discount_percentage')) {
      await sequelize.query(`ALTER TABLE menu_items ADD COLUMN discount_percentage INTEGER NULL`);
      results.push('✅ Added discount_percentage to menu_items');
      console.log('✅ Added discount_percentage');
    }

    if (!itemColumns.find(c => c.column_name === 'discount_start_date')) {
      await sequelize.query(`ALTER TABLE menu_items ADD COLUMN discount_start_date TIMESTAMP WITH TIME ZONE NULL`);
      results.push('✅ Added discount_start_date to menu_items');
      console.log('✅ Added discount_start_date');
    }

    if (!itemColumns.find(c => c.column_name === 'discount_end_date')) {
      await sequelize.query(`ALTER TABLE menu_items ADD COLUMN discount_end_date TIMESTAMP WITH TIME ZONE NULL`);
      results.push('✅ Added discount_end_date to menu_items');
      console.log('✅ Added discount_end_date');
    }

    // Check and add columns to menu_categories
    console.log('⚙️ Checking menu_categories table...');
    const [catColumns] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='menu_categories' AND column_name IN ('discount_percentage', 'discount_start_date', 'discount_end_date');
    `);

    if (!catColumns.find(c => c.column_name === 'discount_percentage')) {
      await sequelize.query(`ALTER TABLE menu_categories ADD COLUMN discount_percentage INTEGER NULL`);
      results.push('✅ Added discount_percentage to menu_categories');
      console.log('✅ Added discount_percentage to categories');
    }

    if (!catColumns.find(c => c.column_name === 'discount_start_date')) {
      await sequelize.query(`ALTER TABLE menu_categories ADD COLUMN discount_start_date TIMESTAMP WITH TIME ZONE NULL`);
      results.push('✅ Added discount_start_date to menu_categories');
      console.log('✅ Added discount_start_date to categories');
    }

    if (!catColumns.find(c => c.column_name === 'discount_end_date')) {
      await sequelize.query(`ALTER TABLE menu_categories ADD COLUMN discount_end_date TIMESTAMP WITH TIME ZONE NULL`);
      results.push('✅ Added discount_end_date to menu_categories');
      console.log('✅ Added discount_end_date to categories');
    }

    console.log('✅ Migration complete');

    res.json({
      success: true,
      message: 'Discount columns migration completed successfully',
      changes: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Migration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});


// BEĞENİLENLER TOPLU GÜNCELLEME - İçecekler hariç
app.get('/api/debug/mark-favorites', async (req, res) => {
  console.log('🌟 Mark favorites endpoint called');
  try {
    const { MenuItem, MenuCategory } = require('./models');
    const { Op } = require('sequelize');

    // "İçecekler" kategorilerini bul
    const drinkCategories = await MenuCategory.findAll({
      where: {
        name: {
          [Op.iLike]: '%içecek%'
        }
      }
    });

    const drinkCategoryIds = drinkCategories.map(cat => cat.id);

    console.log(`📋 Bulunan içecek kategorileri: ${drinkCategories.length}`);
    drinkCategories.forEach(cat => {
      console.log(`   - ${cat.name}`);
    });

    // İçecekler hariç tüm ürünleri güncelle
    const whereClause = drinkCategoryIds.length > 0
      ? { categoryId: { [Op.notIn]: drinkCategoryIds } }
      : {};

    const [updateCount] = await MenuItem.update(
      { isPopular: true },
      {
        where: {
          ...whereClause,
          isPopular: { [Op.ne]: true }
        }
      }
    );

    // Özet
    const totalItems = await MenuItem.count();
    const popularItems = await MenuItem.count({ where: { isPopular: true } });
    const drinkItems = drinkCategoryIds.length > 0
      ? await MenuItem.count({ where: { categoryId: { [Op.in]: drinkCategoryIds } } })
      : 0;

    res.json({
      success: true,
      message: `${updateCount} ürün beğenilen olarak işaretlendi`,
      stats: {
        updated: updateCount,
        totalItems,
        popularItems,
        drinkItems,
        nonPopularItems: totalItems - popularItems
      },
      drinkCategories: drinkCategories.map(c => c.name),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Mark favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Beğenilenler güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// MENÜ ÜRÜNLERİ TOPLU EKLEME (Ramen, Mantı, Kavurma)
app.get('/api/debug/add-menu-items', async (req, res) => {
  console.log('🍜 Menu items bulk add endpoint called');
  try {
    const { MenuItem, MenuCategory, Restaurant } = require('./models');
    const { Op } = require('sequelize');

    // Restaurant bul (kroren)
    const restaurant = await Restaurant.findOne({
      where: { username: 'kroren' }
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'kroren restoranı bulunamadı!'
      });
    }

    // Kategorileri bul veya oluştur
    const categories = {
      ramen: await MenuCategory.findOne({
        where: {
          restaurantId: restaurant.id,
          name: { [Op.iLike]: '%ramen%' }
        }
      }) || await MenuCategory.create({
        restaurantId: restaurant.id,
        name: 'Ramen',
        description: 'Geleneksel Çin erişteleri',
        order: 4,
        isActive: true,
        kitchenStation: 'Ramen İstasyonu'
      }),

      manti: await MenuCategory.findOne({
        where: {
          restaurantId: restaurant.id,
          name: { [Op.iLike]: '%mantı%' }
        }
      }) || await MenuCategory.create({
        restaurantId: restaurant.id,
        name: 'Mantı',
        description: 'Çin usulü mantılar',
        order: 5,
        isActive: true,
        kitchenStation: 'Mantı İstasyonu'
      }),

      kavurma: await MenuCategory.findOne({
        where: {
          restaurantId: restaurant.id,
          name: { [Op.iLike]: '%kavurma%' }
        }
      }) || await MenuCategory.create({
        restaurantId: restaurant.id,
        name: 'Kavurma',
        description: 'Wok tavada kavurmalar',
        order: 6,
        isActive: true,
        kitchenStation: 'Kavurma İstasyonu'
      })
    };

    // Eklenecek ürünler
    const menuItems = [
      // RAMEN
      {
        name: 'Dilimlenmiş ramen 刀削面',
        description: 'Geleneksel el yapımı Çin eriştesi',
        price: 248,
        categoryId: categories.ramen.id,
        preparationTime: 15,
        isAvailable: true,
        isPopular: true
      },

      // MANTI
      {
        name: 'Çüğüre 酸汤水饺',
        description: 'Ekşili mantı çorbası',
        price: 358,
        categoryId: categories.manti.id,
        preparationTime: 20,
        isAvailable: true,
        isPopular: true
      },

      // KAVURMA
      {
        name: 'Soğan et kavurması 洋葱炒牛肉',
        description: 'Soğanlı dana eti kavurması',
        price: 728,
        categoryId: categories.kavurma.id,
        preparationTime: 15,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Kimyonlu dana kavurma 孜然牛肉',
        description: 'Kimyon aromalı dana kavurma',
        price: 728,
        categoryId: categories.kavurma.id,
        preparationTime: 15,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'İstiridye soslu kıvırcık 蚝油生菜',
        description: 'İstiridye soslu lahana',
        price: 398,
        categoryId: categories.kavurma.id,
        preparationTime: 10,
        isAvailable: true,
        isPopular: false
      },
      {
        name: 'Sarımsaklı kıvırcık 蒜蓉包菜',
        description: 'Sarımsaklı lahana kavurması',
        price: 388,
        categoryId: categories.kavurma.id,
        preparationTime: 10,
        isAvailable: true,
        isPopular: false
      },
      {
        name: 'Brokoli kavurma 蒜茄炒蛋',
        description: 'Brokoli kavurması',
        price: 398,
        categoryId: categories.kavurma.id,
        preparationTime: 10,
        isAvailable: true,
        isPopular: false
      },
      {
        name: 'Domatesli yumurta 干锅土豆片',
        description: 'Domates ve yumurta kavurması',
        price: 428,
        categoryId: categories.kavurma.id,
        preparationTime: 12,
        isAvailable: true,
        isPopular: false
      },
      {
        name: 'Acılı kızarmış patates 蒜蓉西兰花',
        description: 'Baharatlı patates kavurması',
        price: 458,
        categoryId: categories.kavurma.id,
        preparationTime: 12,
        isAvailable: true,
        isPopular: false
      },
      {
        name: 'Dana etli körili pilav 咖喱牛肉炒饭',
        description: 'Köri soslu dana etli kızarmış pilav',
        price: 498,
        categoryId: categories.kavurma.id,
        preparationTime: 18,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Tavuklu pilav 鸡肉炒饭',
        description: 'Tavuklu kızarmış pilav',
        price: 458,
        categoryId: categories.kavurma.id,
        preparationTime: 15,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Yumurtalı pilav 蛋炒饭',
        description: 'Klasik yumurtalı kızarmış pilav',
        price: 358,
        categoryId: categories.kavurma.id,
        preparationTime: 12,
        isAvailable: true,
        isPopular: true
      },
      {
        name: 'Dana etli pilav 牛肉炒饭',
        description: 'Dana etli kızarmış pilav',
        price: 498,
        categoryId: categories.kavurma.id,
        preparationTime: 15,
        isAvailable: true,
        isPopular: true
      }
    ];

    let addedCount = 0;
    let skippedCount = 0;
    const addedItems = [];

    for (const item of menuItems) {
      // Aynı isimde ürün var mı kontrol et
      const existing = await MenuItem.findOne({
        where: {
          restaurantId: restaurant.id,
          name: item.name
        }
      });

      if (existing) {
        console.log(`⏭️  Zaten var: ${item.name}`);
        skippedCount++;
        continue;
      }

      const newItem = await MenuItem.create({
        ...item,
        restaurantId: restaurant.id
      });

      console.log(`✅ Eklendi: ${item.name} - ${item.price}₺`);
      addedItems.push({
        name: newItem.name,
        price: newItem.price,
        category: Object.keys(categories).find(k => categories[k].id === item.categoryId)
      });
      addedCount++;
    }

    res.json({
      success: true,
      message: `${addedCount} yeni ürün eklendi, ${skippedCount} ürün zaten vardı`,
      stats: {
        added: addedCount,
        skipped: skippedCount,
        total: menuItems.length
      },
      categories: {
        ramen: categories.ramen.name,
        manti: categories.manti.name,
        kavurma: categories.kavurma.name
      },
      addedItems,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Menu items add error:', error);
    res.status(500).json({
      success: false,
      message: 'Menü ürünleri eklenirken hata oluştu',
      error: error.message
    });
  }
});

// TÜM RESTORANLARIN PLANLARINI VE SUPERADMIN KULLANICILARINI DÜZELT
app.get('/api/debug/fix-plans', async (req, res) => {
  // ... (existing code for fix-plans)
  console.log('🔧 Fix plans endpoint called');
  try {
    const { Restaurant, Staff } = require('./models');
    const bcrypt = require('bcryptjs');
    const restaurants = await Restaurant.findAll();

    const PLAN_LIMITS = {
      basic: { maxTables: 10, maxMenuItems: 50, maxStaff: 3 },
      premium: { maxTables: 25, maxMenuItems: 150, maxStaff: 10 },
      enterprise: { maxTables: 999, maxMenuItems: 999, maxStaff: 999 }
    };

    const superadminPassword = await bcrypt.hash('01528797Mb##', 10);
    let results = [];

    for (const restaurant of restaurants) {
      const limits = PLAN_LIMITS[restaurant.subscriptionPlan] || PLAN_LIMITS.basic;

      const needsLimitUpdate =
        restaurant.maxTables !== limits.maxTables ||
        restaurant.maxMenuItems !== limits.maxMenuItems ||
        restaurant.maxStaff !== limits.maxStaff;

      if (needsLimitUpdate) {
        await restaurant.update({
          maxTables: limits.maxTables,
          maxMenuItems: limits.maxMenuItems,
          maxStaff: limits.maxStaff
        });
      }

      const [staff, created] = await Staff.findOrCreate({
        where: { restaurantId: restaurant.id, username: 'restxqr' },
        defaults: {
          name: 'RestXQR Superadmin',
          email: 'admin@restxqr.com',
          password: superadminPassword,
          role: 'admin',
          isActive: true
        }
      });

      if (!created) {
        await staff.update({ password: superadminPassword, role: 'admin', isActive: true });
      }

      results.push({
        name: restaurant.name,
        plan: restaurant.subscriptionPlan,
        updated: needsLimitUpdate
      });
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Fix plans error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// SCHEMA INSPECTOR
app.get('/api/debug/schema/:tableName', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    const { tableName } = req.params;

    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = '${tableName}';
    `);

    res.json({ success: true, columns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// RAW MENU ITEM SEARCH
app.get('/api/debug/menu-item-raw', async (req, res) => {
  try {
    const { MenuItem } = require('./models');
    const { search } = req.query;
    const { Op } = require('sequelize');

    const items = await MenuItem.findAll({
      where: {
        name: { [Op.iLike]: `%${search}%` }
      }
    });

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GENERIC COLUMN ADDER
app.post('/api/debug/add-column', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    const { tableName, columnName, columnType } = req.body;

    // Check if exists
    const [check] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='${tableName}' AND column_name='${columnName}';
    `);

    if (check.length > 0) {
      return res.json({ success: true, message: 'Column already exists' });
    }

    await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);

    res.json({ success: true, message: `Added ${columnName} to ${tableName}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// TÜM SİPARİŞLERİ SİL (Debug/Test için)
app.post('/api/debug/delete-all-orders', async (req, res) => {
  console.log('🗑️ Delete all orders endpoint called');
  try {
    const { Order, OrderItem } = require('./models');

    // First delete all order items
    await OrderItem.destroy({ where: {}, truncate: false }); // Truncate can fail with FKs, use where: {}
    console.log(`🗑️ Deleted order items`);

    // Then delete all orders
    const deletedOrders = await Order.destroy({ where: {}, truncate: false });
    console.log(`🗑️ Deleted ${deletedOrders} orders`);

    res.json({
      success: true,
      message: 'Tüm siparişler başarıyla silindi',
      deletedOrders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Delete All Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Siparişler silinirken hata oluştu',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/restaurants', require('./routes/menu')); // Menu routes nested under restaurants
app.use('/api/qr', require('./routes/qr')); // QR code management
app.use('/api/staff', require('./routes/staff')); // Staff management
app.use('/api/waiter', require('./routes/waiter')); // Waiter calls
app.use('/api/printers', require('./routes/printers')); // Thermal printer management
app.use('/api/admin/setup', require('./routes/adminSetup')); // Admin setup
app.use('/api/admin/auth', require('./routes/adminAuth')); // Admin authentication
app.use('/api/admin/2fa', require('./routes/admin2fa')); // Admin 2FA
app.use('/api/admin/dashboard', require('./routes/adminDashboard')); // Admin dashboard
app.use('/api/admin/companies', require('./routes/adminCompanies')); // Şirketler (çoklu şube)
app.use('/api/plans', require('./routes/plans')); // Plan management
app.use('/api/support', require('./routes/support')); // Support tickets
app.use('/api/temp-admin', require('./routes/tempSuperAdmin')); // TEMPORARY ADMIN CREATION
app.use('/api/admin-fix', require('./routes/adminFix')); // ADMIN RECOVERY TOOL
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
app.use('/api/settings', require('./routes/settings')); // Restaurant settings management
app.use('/api/permissions', require('./routes/permissions').router); // Role-based permissions management
app.use('/api/sync', require('./routes/sync')); // Menu synchronization
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

// E-POSTA TEST ENDPOINT'İ
app.get('/api/debug/test-email', async (req, res) => {
  console.log('📧 Debug email test endpoint called');
  try {
    const nodemailer = require('nodemailer');

    // Transporter konfigürasyonu (emailService.js ile aynı)
    const transporter = nodemailer.createTransport({
      host: 'w01dc0ea.kasserver.com',
      port: 587,
      secure: false,
      auth: {
        user: 'bp@xezmet.at',
        pass: '1528797Mb'
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Show debug output
      logger: true // Log information to console
    });

    // 1. Bağlantıyı test et
    console.log('🔌 SMTP bağlantısı test ediliyor...');
    await transporter.verify();
    console.log('✅ SMTP bağlantısı başarılı!');

    // 2. Test maili gönder
    console.log('📨 Test maili gönderiliyor...');
    const info = await transporter.sendMail({
      from: '"Debug Test" <bp@xezmet.at>',
      to: 'bp@xezmet.at',
      subject: 'RestXQr Test E-postası',
      text: 'Bu bir test e-postasıdır. Eğer bunu görüyorsanız SMTP ayarları çalışıyor demektir.',
      html: '<h3>Test Başarılı!</h3><p>Bu e-posta RestXQr sisteminden test amaçlı gönderilmiştir.</p><p>Zaman: ' + new Date().toLocaleString('tr-TR') + '</p>'
    });

    console.log('✅ Test maili gönderildi:', info.messageId);

    res.json({
      success: true,
      message: 'Test e-postası başarıyla gönderildi',
      details: {
        messageId: info.messageId,
        response: info.response,
        envelope: info.envelope
      }
    });

  } catch (error) {
    console.error('❌ E-posta test hatası:', error);
    res.status(500).json({
      success: false,
      message: 'E-posta testi başarısız oldu',
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
  }
});

// Demo talep endpoint'i
// Demo talep endpoint'i
app.post('/api/demo-request', async (req, res) => {
  try {
    const { name, email, phone, company, message, language, source } = req.body;
    console.log('📧 Demo talep alındı:', { name, email, phone, company, language, source });

    // E-posta gönderim servisini çağır
    const { sendDemoRequestEmail } = require('./services/emailService');
    const emailResult = await sendDemoRequestEmail(req.body);

    if (!emailResult.success) {
      console.error('❌ E-posta gönderim başarısız:', emailResult.error);
      throw new Error('E-posta gönderilemedi');
    }

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

// Cloudinary Status Check
app.get('/api/admin/cloudinary-status', async (req, res) => {
  try {
    const { cloudinary } = require('./lib/cloudinary');
    const result = await cloudinary.api.usage();
    res.json({
      success: true,
      data: result,
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        has_api_key: !!process.env.CLOUDINARY_API_KEY,
        has_api_secret: !!process.env.CLOUDINARY_API_SECRET
      }
    });
  } catch (error) {
    console.error('❌ Cloudinary status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Repair Images Explicitly
app.get('/api/admin/repair-kroren-images', async (req, res) => {
  try {
    const { MenuItem, Restaurant } = require('./models');
    const { uploadToCloudinary } = require('./lib/cloudinary');
    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');

    console.log('🔧 Kroren Resim Tamiri Başlatılıyor...');

    const kroren = await Restaurant.findOne({ where: { username: 'kroren' } });
    if (!kroren) throw new Error('Kroren restoranı bulunamadı');

    const menuData = require('./data/kroren_scraped.json');
    let repaired = 0;
    let errors = [];

    for (const item of menuData) {
      const dbItem = await MenuItem.findOne({
        where: { restaurantId: kroren.id, name: item.name }
      });

      if (dbItem) {
        const needsRepair = !dbItem.imageUrl || dbItem.imageUrl.startsWith('/uploads/');
        if (needsRepair && item.imageUrl && item.imageUrl.startsWith('http')) {
          try {
            console.log(`📸 Tamir ediliyor: ${item.name}`);
            const response = await axios.get(item.imageUrl, { responseType: 'arraybuffer', timeout: 5000 });
            const buffer = Buffer.from(response.data, 'binary');
            const result = await uploadToCloudinary(buffer, {
              folder: 'restxqr/products',
              public_id: `repair_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            });
            await dbItem.update({ imageUrl: result.secure_url });
            repaired++;
          } catch (e) {
            console.error(`❌ Hata (${item.name}):`, e.message);
            errors.push({ name: item.name, error: e.message });
          }
        }
      }
    }

    res.json({
      success: true,
      repairedCount: repaired,
      errorCount: errors.length,
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('❌ Tamir endpoint hatası:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kasa istasyonu ekleme endpoint'i
app.get('/api/debug/add-kasa-station', async (req, res) => {
  console.log('💰 Add Kasa station endpoint called');
  try {
    const { Restaurant } = require('./models');
    const restaurant = await Restaurant.findOne({ where: { username: 'kroren' } });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Kroren restoranı bulunamadı' });
    }

    let stations = restaurant.kitchenStations || [];
    let updated = false;

    // İstasyon listesine ekle
    if (!stations.find(s => s.id === 'kasa')) {
      stations.push({
        id: 'kasa',
        name: 'Kasa',
        emoji: '💰',
        color: '#10b981',
        order: stations.length + 1
      });
      updated = true;
    }

    // Printer konfigürasyonuna ekle
    let printerConfig = restaurant.printerConfig || {};
    if (!printerConfig['kasa']) {
      printerConfig['kasa'] = {
        ip: '',
        port: 9100,
        enabled: true
      };
      updated = true;
    }

    if (updated) {
      await restaurant.update({
        kitchenStations: stations,
        printerConfig: printerConfig
      });
      console.log('✅ Kasa station added to Kroren');
    }

    res.json({
      success: true,
      message: updated ? 'Kasa istasyonu başarıyla eklendi.' : 'Kasa istasyonu zaten mevcut.',
      data: {
        kitchenStations: restaurant.kitchenStations,
        printerConfig: restaurant.printerConfig
      }
    });

  } catch (error) {
    console.error('❌ Add Kasa Error:', error);
    res.status(500).json({
      success: false,
      message: 'Kasa istasyonu eklenirken bir hata oluştu',
      error: error.message
    });
  }
});

// Kroren İçecekleri 'icecek' istasyonuna atama script'i
app.get('/api/debug/assign-kroren-drinks', async (req, res) => {
  console.log('🥤 Assign Kroren drinks endpoint called');
  try {
    const { Restaurant, MenuItem, MenuCategory } = require('./models');
    const { Op } = require('sequelize');

    const restaurant = await Restaurant.findOne({ where: { username: 'kroren' } });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Kroren not found' });

    // 1. İçecek kategorilerini bul
    const drinkCategories = await MenuCategory.findAll({
      where: {
        restaurantId: restaurant.id,
        name: { [Op.iLike]: '%içecek%' }
      }
    });

    const catIds = drinkCategories.map(c => c.id);

    // 2. Bu kategorilerdeki ürünleri 'icecek' istasyonuna ata
    const [updatedCount] = await MenuItem.update(
      { kitchenStation: 'icecek' },
      {
        where: {
          restaurantId: restaurant.id,
          categoryId: { [Op.in]: catIds }
        }
      }
    );

    // 3. İsmi 'cola', 'fanta', 'su', 'soda', 'sprite', 'çay' vb geçenleri de kontrol et
    const keywords = ['cola', 'fanta', 'su', 'soda', 'sprite', 'çay', 'ayran', 'meyve suyu', 'limonata', 'lipton', 'buzlu çay'];
    let keywordUpdated = 0;

    for (const kw of keywords) {
      const [count] = await MenuItem.update(
        { kitchenStation: 'icecek' },
        {
          where: {
            restaurantId: restaurant.id,
            name: { [Op.iLike]: `%${kw}%` },
            kitchenStation: { [Op.or]: [null, ''] } // Sadece atanmamış olanları ata
          }
        }
      );
      keywordUpdated += count;
    }

    res.json({
      success: true,
      message: `${updatedCount + keywordUpdated} ürün 'icecek' istasyonuna atandı.`,
      debug: {
        categoryBased: updatedCount,
        keywordBased: keywordUpdated,
        categoriesMatched: drinkCategories.map(c => c.name)
      }
    });
  } catch (error) {
    console.error('❌ Hata:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Popüler ürünleri sıfırlama endpoint'i
app.get('/api/debug/reset-popular', async (req, res) => {
  console.log('🗑️ Reset popular endpoint called');
  try {
    const { MenuItem } = require('./models');

    // Şu an popüler olan ürünleri bul
    const popularItems = await MenuItem.findAll({
      where: { isPopular: true },
      attributes: ['id', 'name']
    });

    if (popularItems.length === 0) {
      return res.json({
        success: true,
        message: 'Şu anda popüler olarak işaretlenmiş ürün bulunmamaktadır.',
        updatedCount: 0
      });
    }

    // Tüm ürünleri güncelle
    const [updateCount] = await MenuItem.update(
      { isPopular: false },
      {
        where: { isPopular: true }
      }
    );

    console.log(`✅ Success: Unmarked ${updateCount} popular items`);

    res.json({
      success: true,
      message: `${updateCount} üründen popüler işareti başarıyla kaldırıldı.`,
      updatedCount: updateCount,
      previouslyPopular: popularItems.map(item => item.name)
    });

  } catch (error) {
    console.error('❌ Reset Popular Error:', error);
    res.status(500).json({
      success: false,
      message: 'Popüler ürünler sıfırlanırken bir hata oluştu',
      error: error.message
    });
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

// Schema debug endpoint for qr_tokens
app.get('/api/debug/qr-schema', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'qr_tokens';
    `);

    const [tableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'qr_tokens'
      );
    `);

    res.json({
      success: true,
      tableExists: tableExists[0].exists,
      columns: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Schema check failed',
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
    message: err.message || 'Internal server error',
    originalError: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Global error handler (MUST be last, after all routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler (MUST be after error handler)
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
      console.log('🔄 Starting database schema synchronization (ALTER mode)...');
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synced successfully - All missing columns added');
    } catch (syncError) {
      console.error('⚠️ Database sync warning:', syncError.message);
    }
  } catch (error) {
    console.error('⚠️ Database connection failed, but server continues running:', error.message);
    console.log('🔐 2FA endpoints will work without database');
  }

  // Örnek yazıcı istasyonları ekle (Çince desteği ile)
  try {
    const printerService = require('./services/printerService');

    // Örnek istasyonlar - Kullanıcı kendi IP adreslerini girecek
    printerService.addOrUpdateStation('kitchen', {
      name: '厨房', // Mutfak (Çince)
      ip: null, // Kullanıcı ayarlayacak
      port: 9100,
      enabled: false,
      type: 'epson',
      language: 'zh', // Çince
      characterSet: 'PC936_CHINESE',
      codePage: 'GB18030'
    });

    printerService.addOrUpdateStation('bar', {
      name: 'Bar',
      ip: null,
      port: 9100,
      enabled: false,
      type: 'epson',
      language: 'tr', // Türkçe
      characterSet: 'PC857_TURKISH',
      codePage: 'CP857'
    });

    printerService.addOrUpdateStation('dessert', {
      name: 'Tatlı',
      ip: null,
      port: 9100,
      enabled: false,
      type: 'epson',
      language: 'tr',
      characterSet: 'PC857_TURKISH',
      codePage: 'CP857'
    });

    console.log('✅ Örnek yazıcı istasyonları oluşturuldu (Çince desteği ile)');
  } catch (printerError) {
    console.error('⚠️ Yazıcı servisi başlatılamadı:', printerError.message);
  }

  return server;
};

startServer();

module.exports = app;


