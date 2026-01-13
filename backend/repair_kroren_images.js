const { MenuItem, Restaurant } = require('./src/models');
const { uploadToCloudinary } = require('./src/utils/importHandler'); // I should check if it's exported there or in lib
const cloudinaryLib = require('./src/lib/cloudinary');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// We need a specific uploadToCloudinary that handles buffers
const uploadToCloudinary = cloudinaryLib.uploadToCloudinary;

async function repairImages() {
    console.log('🔧 Kroren Menü Resim Tamiri Başladı...');

    try {
        // 1. Kroren'i bul
        const restaurant = await Restaurant.findOne({
            where: { username: 'kroren' }
        });

        if (!restaurant) {
            console.error('❌ Kroren restoranı bulunamadı!');
            return;
        }

        console.log(`📍 Restoran: ${restaurant.name} (${restaurant.id})`);

        // 2. JSON verisini oku
        const menuData = JSON.parse(fs.readFileSync('./src/data/kroren_scraped.json', 'utf8'));
        console.log(`📋 JSON dosyasında ${menuData.length} ürün var.`);

        let fixedCount = 0;
        let errorCount = 0;

        // 3. Her ürünü kontrol et
        for (const item of menuData) {
            // Veritabanında bu ismi bul
            const dbItem = await MenuItem.findOne({
                where: {
                    restaurantId: restaurant.id,
                    name: item.name
                }
            });

            if (!dbItem) {
                console.log(`🔎 Ürün bulunamadı (eklenmemiş olabilir): ${item.name}`);
                continue;
            }

            // Resim yoksa veya yerel /uploads/ ise (eski hatalı kayıt) ve JSON'da resim varsa
            const hasNoImage = !dbItem.imageUrl || dbItem.imageUrl.startsWith('/uploads/');

            if (hasNoImage && item.imageUrl && item.imageUrl.startsWith('http')) {
                console.log(`📸 Resim eksik/hatalı: ${item.name}. Yükleniyor...`);

                try {
                    const imageResponse = await axios.get(item.imageUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(imageResponse.data, 'binary');

                    const uploadResult = await uploadToCloudinary(buffer, {
                        folder: 'restxqr/products',
                        public_id: `kroren_fix_${Date.now()}_${Math.round(Math.random() * 1000)}`
                    });

                    await dbItem.update({
                        imageUrl: uploadResult.secure_url
                    });

                    console.log(`✅ Başarıyla güncellendi: ${item.name}`);
                    fixedCount++;
                } catch (imgError) {
                    console.error(`⚠️ Resim yükleme hatası (${item.name}):`, imgError.message);
                    errorCount++;
                }
            } else {
                // console.log(`⏭️ Zaten resmi var veya JSON'da resim yok: ${item.name}`);
            }
        }

        console.log(`\n✨ İşlem Tamamlandı!`);
        console.log(`✅ Onarılan resim sayısı: ${fixedCount}`);
        console.log(`❌ Hata sayısı: ${errorCount}`);

    } catch (error) {
        console.error('❌ Tamir sırasında genel hata:', error);
    } finally {
        process.exit();
    }
}

repairImages();
