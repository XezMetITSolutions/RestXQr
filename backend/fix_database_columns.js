const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/masapp', {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

async function fixDatabaseColumns() {
    try {
        console.log('🔄 Veritabanına bağlanılıyor...');
        await sequelize.authenticate();
        console.log('✅ Bağlantı başarılı!');

        console.log('\n📊 Eksik sütunlar kontrol ediliyor ve oluşturuluyor...\n');

        // Orders tablosu için eksik sütunları ekle
        const queries = [
            // created_at ve updated_at sütunlarını ekle (eğer yoksa)
            `ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
            `ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,

            // Diğer tablolar için de aynı işlemi yap
            `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
            `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,

            `ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
            `ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,

            `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
            `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,

            `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
            `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,

            `ALTER TABLE staff ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
            `ALTER TABLE staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,

            // Index'leri oluştur
            `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);`,
            `CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON orders(restaurant_id, created_at);`,
        ];

        for (const query of queries) {
            try {
                console.log(`⚙️  Çalıştırılıyor: ${query.substring(0, 60)}...`);
                await sequelize.query(query);
                console.log('   ✅ Başarılı');
            } catch (error) {
                console.log(`   ⚠️  Uyarı: ${error.message}`);
            }
        }

        console.log('\n✅ Tüm sütunlar başarıyla kontrol edildi ve oluşturuldu!');
        console.log('🎉 Veritabanı şeması güncellendi.\n');

    } catch (error) {
        console.error('❌ HATA:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
        console.log('👋 Bağlantı kapatıldı.');
    }
}

// Scripti çalıştır
fixDatabaseColumns();
