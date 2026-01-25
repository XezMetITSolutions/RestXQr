/**
 * Beğenilenler Toplu Güncelleme Script
 * İçecekler kategorisi hariç tüm ürünleri beğenilen olarak işaretler
 */

const { MenuItem, MenuCategory } = require('./src/models');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;

async function markAllAsFavoriteExceptDrinks() {
    try {
        console.log('🚀 Beğenilenler güncelleme başlıyor...\n');

        // "İçecekler" kategorilerini bul (farklı isimlerde olabilir)
        const drinkCategories = await MenuCategory.findAll({
            where: {
                name: {
                    [Op.iLike]: '%içecek%' // case-insensitive içecek araması
                }
            }
        });

        const drinkCategoryIds = drinkCategories.map(cat => cat.id);

        console.log(`📋 Bulunan içecek kategorileri (${drinkCategoryIds.length}):`);
        drinkCategories.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.id})`);
        });
        console.log('');

        // İçecekler hariç tüm ürünleri bul
        const whereClause = drinkCategoryIds.length > 0
            ? { categoryId: { [Op.notIn]: drinkCategoryIds } }
            : {}; // Eğer içecek kategorisi yoksa tüm ürünleri al

        const productsToUpdate = await MenuItem.findAll({
            where: {
                ...whereClause,
                isPopular: { [Op.ne]: true } // Zaten beğenilen olmayanlar
            },
            include: [{
                model: MenuCategory,
                as: 'category',
                attributes: ['name']
            }]
        });

        console.log(`✨ Güncellenecek ürün sayısı: ${productsToUpdate.length}\n`);

        if (productsToUpdate.length === 0) {
            console.log('ℹ️  Güncellenecek ürün bulunamadı. Tüm ürünler zaten beğenilen olabilir.');
            process.exit(0);
        }

        // İlk 10 ürünü göster (örnek)
        console.log('📦 Güncellenecek ürünlerden örnekler:');
        productsToUpdate.slice(0, 10).forEach((item, idx) => {
            console.log(`   ${idx + 1}. ${item.name} (${item.category?.name || 'Kategori yok'}) - ${item.price}₺`);
        });

        if (productsToUpdate.length > 10) {
            console.log(`   ... ve ${productsToUpdate.length - 10} ürün daha\n`);
        } else {
            console.log('');
        }

        // Onay iste
        console.log('⚠️  DİKKAT: Bu işlem geri alınamaz!');
        console.log('💡 İptal etmek için Ctrl+C, devam etmek için herhangi bir tuşa basın...\n');

        // 5 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Toplu güncelleme yap
        const [updateCount] = await MenuItem.update(
            { isPopular: true },
            {
                where: {
                    ...whereClause,
                    isPopular: { [Op.ne]: true }
                }
            }
        );

        console.log(`\n✅ Başarılı! ${updateCount} ürün beğenilen olarak işaretlendi!\n`);

        // Özet göster
        const totalItems = await MenuItem.count();
        const popularItems = await MenuItem.count({ where: { isPopular: true } });
        const drinkItems = drinkCategoryIds.length > 0
            ? await MenuItem.count({ where: { categoryId: { [Op.in]: drinkCategoryIds } } })
            : 0;

        console.log('📊 ÖZET:');
        console.log(`   • Toplam ürün sayısı: ${totalItems}`);
        console.log(`   • Beğenilen ürün sayısı: ${popularItems}`);
        console.log(`   • İçecek kategorisi ürün sayısı: ${drinkItems}`);
        console.log(`   • Beğenilmeyen ürün sayısı: ${totalItems - popularItems}\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Hata oluştu:', error);
        process.exit(1);
    }
}

// Script'i çalıştır
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  🌟 Beğenilenler Toplu Güncelleme');
console.log('  İçecekler hariç tüm ürünleri beğenilenlere ekler');
console.log('═══════════════════════════════════════════════════════');
console.log('');

markAllAsFavoriteExceptDrinks();
