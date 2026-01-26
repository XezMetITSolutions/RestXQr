/**
 * Menü Ürünleri Toplu Ekleme Script
 * Ramen, Mantı ve Kavurma kategorilerine ürünler ekler
 */

const { MenuItem, MenuCategory, Restaurant } = require('./src/models');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;

async function addMenuItems() {
    try {
        console.log('🚀 Menü ürünleri ekleme başlıyor...\n');

        // Restaurant bul (kroren)
        const restaurant = await Restaurant.findOne({
            where: { username: 'kroren' }
        });

        if (!restaurant) {
            console.error('❌ kroren restoranı bulunamadı!');
            process.exit(1);
        }

        console.log(`✅ Restoran bulundu: ${restaurant.name} (${restaurant.id})\n`);

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

        console.log('📁 Kategoriler hazır:');
        console.log(`   - Ramen: ${categories.ramen.name} (${categories.ramen.id})`);
        console.log(`   - Mantı: ${categories.manti.name} (${categories.manti.id})`);
        console.log(`   - Kavurma: ${categories.kavurma.name} (${categories.kavurma.id})`);
        console.log('');

        // Eklenecek ürünler
        const menuItems = [
            // RAMEN
            {
                name: 'Dilimlenmiş ramen',
                description: '刀削面 - Geleneksel el yapımı Çin eriştesi',
                price: 248,
                categoryId: categories.ramen.id,
                preparationTime: 15,
                isAvailable: true,
                isPopular: true
            },

            // MANTI
            {
                name: 'Çüğüre',
                description: '酸汤水饺 - Ekşili mantı çorbası',
                price: 358,
                categoryId: categories.manti.id,
                preparationTime: 20,
                isAvailable: true,
                isPopular: true
            },

            // KAVURMA
            {
                name: 'Soğan et kavurması',
                description: '洋葱炒牛肉 - Soğanlı dana eti kavurması',
                price: 728,
                categoryId: categories.kavurma.id,
                preparationTime: 15,
                isAvailable: true,
                isPopular: true
            },
            {
                name: 'Kimyonlu dana kavurma',
                description: '孜然牛肉 - Kimyon aromalı dana kavurma',
                price: 728,
                categoryId: categories.kavurma.id,
                preparationTime: 15,
                isAvailable: true,
                isPopular: true
            },
            {
                name: 'İstiridye soslu kıvırcık',
                description: '蚝油生菜 - İstiridye soslu lahana',
                price: 398,
                categoryId: categories.kavurma.id,
                preparationTime: 10,
                isAvailable: true,
                isPopular: false
            },
            {
                name: 'Sarımsaklı kıvırcık',
                description: '蒜蓉包菜 - Sarımsaklı lahana kavurması',
                price: 388,
                categoryId: categories.kavurma.id,
                preparationTime: 10,
                isAvailable: true,
                isPopular: false
            },
            {
                name: 'Brokoli kavurma',
                description: '蒜茄炒蛋 - Brokoli kavurması',
                price: 398,
                categoryId: categories.kavurma.id,
                preparationTime: 10,
                isAvailable: true,
                isPopular: false
            },
            {
                name: 'Domatesli yumurta',
                description: '干锅土豆片 - Domates ve yumurta kavurması',
                price: 428,
                categoryId: categories.kavurma.id,
                preparationTime: 12,
                isAvailable: true,
                isPopular: false
            },
            {
                name: 'Acılı kızarmış patates',
                description: '蒜蓉西兰花 - Baharatlı patates kavurması',
                price: 458,
                categoryId: categories.kavurma.id,
                preparationTime: 12,
                isAvailable: true,
                isPopular: false
            },
            {
                name: 'Dana etli körili pilav',
                description: '咖喱牛肉炒饭 - Köri soslu dana etli kızarmış pilav',
                price: 498,
                categoryId: categories.kavurma.id,
                preparationTime: 18,
                isAvailable: true,
                isPopular: true
            },
            {
                name: 'Tavuklu pilav',
                description: '鸡肉炒饭 - Tavuklu kızarmış pilav',
                price: 458,
                categoryId: categories.kavurma.id,
                preparationTime: 15,
                isAvailable: true,
                isPopular: true
            },
            {
                name: 'Yumurtalı pilav',
                description: '蛋炒饭 - Klasik yumurtalı kızarmış pilav',
                price: 358,
                categoryId: categories.kavurma.id,
                preparationTime: 12,
                isAvailable: true,
                isPopular: true
            },
            {
                name: 'Dana etli pilav',
                description: '牛肉炒饭 - Dana etli kızarmış pilav',
                price: 498,
                categoryId: categories.kavurma.id,
                preparationTime: 15,
                isAvailable: true,
                isPopular: true
            }
        ];

        console.log(`📦 ${menuItems.length} ürün eklenecek...\n`);

        let addedCount = 0;
        let skippedCount = 0;

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

            await MenuItem.create({
                ...item,
                restaurantId: restaurant.id
            });

            console.log(`✅ Eklendi: ${item.name} - ${item.price}₺`);
            addedCount++;
        }

        console.log('\n═══════════════════════════════════════════════');
        console.log(`✅ İşlem tamamlandı!`);
        console.log(`   • ${addedCount} yeni ürün eklendi`);
        console.log(`   • ${skippedCount} ürün zaten vardı`);
        console.log(`   • ${addedCount + skippedCount} toplam ürün`);
        console.log('═══════════════════════════════════════════════\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Hata oluştu:', error);
        process.exit(1);
    }
}

// Script'i çalıştır
console.log('');
console.log('═══════════════════════════════════════════════');
console.log('  🍜 Menü Ürünleri Toplu Ekleme');
console.log('  Ramen, Mantı ve Kavurma kategorileri');
console.log('═══════════════════════════════════════════════');
console.log('');

addMenuItems();
