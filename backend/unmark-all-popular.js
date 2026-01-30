/**
 * Popüler Ürünleri Sıfırlama Scripti
 * Tüm ürünlerden "isPopular" (Popüler) işaretini kaldırır.
 */

const { MenuItem } = require('./src/models');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;

async function unmarkAllPopular() {
    try {
        console.log('🚀 Popüler ürünleri sıfırlama işlemi başlıyor...\n');

        // Şu an popüler olan ürünleri bul
        const popularItems = await MenuItem.findAll({
            where: { isPopular: true },
            attributes: ['id', 'name']
        });

        if (popularItems.length === 0) {
            console.log('ℹ️  Şu anda popüler olarak işaretlenmiş ürün bulunmamaktadır.');
            process.exit(0);
        }

        console.log(`📋 Şu anda ${popularItems.length} adet ürün popüler olarak işaretli:`);
        popularItems.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.name}`);
        });

        console.log('\n⚠️  DİKKAT: Yukarıdaki bütün ürünlerden popüler işareti kaldırılacak!');
        console.log('💡 İşlem başlıyor...\n');

        // Tüm ürünleri güncelle
        const [updateCount] = await MenuItem.update(
            { isPopular: false },
            {
                where: { isPopular: true }
            }
        );

        console.log(`\n✅ Başarılı! ${updateCount} üründen popüler işareti kaldırıldı.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Hata oluştu:', error);
        process.exit(1);
    }
}

// Script'i çalıştır
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  🗑️  Popüler Ürünleri Sıfırlama');
console.log('  Bütün ürünlerden popüler işaretini kaldırır');
console.log('═══════════════════════════════════════════════════════');
console.log('');

unmarkAllPopular();
