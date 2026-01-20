const { Sequelize } = require('sequelize');
require('dotenv').config();

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

async function addVariantsColumn() {
    try {
        console.log('🔄 Veritabanına bağlanılıyor...');
        await sequelize.authenticate();
        console.log('✅ Bağlantı başarılı!');

        const query = `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;`;

        console.log(`⚙️  Çalıştırılıyor: ${query}`);
        await sequelize.query(query);
        console.log('✅ variants sütunu başarıyla eklendi!');

    } catch (error) {
        console.error('❌ HATA:', error.message);
    } finally {
        await sequelize.close();
    }
}

addVariantsColumn();
