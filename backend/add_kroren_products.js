const API_BASE = 'https://masapp-backend.onrender.com/api';

// Kroren restoranı ID'si
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

// Kategoriler ve ürünler
const categoriesWithProducts = [
  {
    category: {
      name: 'Makarnalar & Noodle',
      description: 'Çin mutfağından özel makarna ve noodle çeşitleri',
      displayOrder: 1
    },
    products: [
      {
        name: 'Ganbian Makarnası',
        description: 'Özel soslu ganbian makarnası',
        price: 694,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 520,
        preparationTime: 20,
        ingredients: 'Makarna, Özel sos, Sebzeler, Baharatlar',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 1
      },
      {
        name: 'Sebzeli Noodle',
        description: 'Taze sebzelerle hazırlanmış noodle',
        price: 522,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 380,
        preparationTime: 15,
        ingredients: 'Noodle, Brokoli, Havuç, Mantar, Soğan, Sarımsak',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 2
      },
      {
        name: 'Tavuk Noodle',
        description: 'Tavuk parçaları ile noodle',
        price: 566,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 450,
        preparationTime: 18,
        ingredients: 'Noodle, Tavuk göğsü, Sebzeler, Özel sos',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 3
      },
      {
        name: 'Dana Noodle',
        description: 'Dana eti ile noodle',
        price: 648,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 580,
        preparationTime: 22,
        ingredients: 'Noodle, Dana eti, Sebzeler, Özel sos, Baharatlar',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 4
      }
    ]
  },
  {
    category: {
      name: 'Tavuk Yemekleri',
      description: 'Özel soslu ve baharatlı tavuk yemekleri',
      displayOrder: 2
    },
    products: [
      {
        name: 'Acılı Lokum Tavuk',
        description: 'Acılı lokum soslu tavuk',
        price: 650,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 420,
        preparationTime: 25,
        ingredients: 'Tavuk but, Acılı lokum sosu, Biber, Soğan, Sarımsak',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 1
      },
      {
        name: 'Portakallı Çıtır Tavuk',
        description: 'Portakal soslu çıtır tavuk',
        price: 650,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 480,
        preparationTime: 28,
        ingredients: 'Tavuk göğsü, Portakal suyu, Bal, Un, Yumurta',
        allergens: ['gluten', 'eggs', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 2
      },
      {
        name: 'Tatlı Ekşi Tavuk',
        description: 'Tatlı ekşi soslu tavuk',
        price: 550,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 450,
        preparationTime: 20,
        ingredients: 'Tavuk göğsü, Domates sosu, Ananas, Biber, Soğan',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 3
      }
    ]
  },
  {
    category: {
      name: 'Ana Yemekler / Diğer',
      description: 'Ana yemekler ve özel lezzetler',
      displayOrder: 3
    },
    products: [
      {
        name: 'Buharda Mantı',
        description: 'Geleneksel buharda pişirilmiş mantı',
        price: 651,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 320,
        preparationTime: 30,
        ingredients: 'Hamur, Kıyma, Soğan, Baharatlar, Tereyağı',
        allergens: ['gluten'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 1
      },
      {
        name: 'Dana Etli Rojamo',
        description: 'Dana eti ile hazırlanmış rojamo',
        price: 545,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        calories: 550,
        preparationTime: 15,
        ingredients: 'Dana eti, Ekmek, Soğan, Biber, Baharatlar',
        allergens: ['gluten'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 2
      },
      {
        name: 'Özel Soslu Tofu',
        description: 'Özel sos ile hazırlanmış tofu',
        price: 651,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 280,
        preparationTime: 18,
        ingredients: 'Tofu, Özel sos, Sebzeler, Susam',
        allergens: ['soy'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 3
      }
    ]
  },
  {
    category: {
      name: 'Yan Ürünler & Atıştırmalıklar',
      description: 'Yan yemekler ve atıştırmalıklar',
      displayOrder: 4
    },
    products: [
      {
        name: 'Sade Pilav',
        description: 'Geleneksel sade pilav',
        price: 227,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-4c5c0e5e0a5e?w=800&q=80',
        calories: 200,
        preparationTime: 20,
        ingredients: 'Pirinç, Su, Tuz, Tereyağı',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 1
      },
      {
        name: 'Karides Krakeri / Cips',
        description: 'Çıtır karides krakeri',
        price: 245,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 180,
        preparationTime: 5,
        ingredients: 'Karides unu, Nişasta, Tuz, Baharatlar',
        allergens: ['shellfish', 'gluten'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 2
      },
      {
        name: 'Buharda Sade Ekmek',
        description: 'Buharda pişirilmiş sade ekmek',
        price: 82.50,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
        calories: 150,
        preparationTime: 15,
        ingredients: 'Un, Su, Maya, Tuz',
        allergens: ['gluten'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 3
      }
    ]
  },
  {
    category: {
      name: 'Salatalar',
      description: 'Taze ve lezzetli salata çeşitleri',
      displayOrder: 5
    },
    products: [
      {
        name: 'Erişteli Salata',
        description: 'Erişte ile hazırlanmış özel salata',
        price: 220,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        calories: 250,
        preparationTime: 12,
        ingredients: 'Erişte, Sebzeler, Susam, Özel sos',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 1
      }
    ]
  },
  {
    category: {
      name: 'İçecekler',
      description: 'Soğuk ve sıcak içecekler',
      displayOrder: 6
    },
    products: [
      {
        name: 'Su (50 cl)',
        description: '50 cl su',
        price: 30,
        imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
        calories: 0,
        preparationTime: 0,
        ingredients: 'Su',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 1
      },
      {
        name: 'Kutu İçecekler',
        description: 'Cola, Fanta, Ice Tea vb.',
        price: 115,
        imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
        calories: 150,
        preparationTime: 0,
        ingredients: 'Gazlı içecek',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 2
      },
      {
        name: 'Niğde Gazozu',
        description: 'Geleneksel Niğde gazozu',
        price: 50,
        imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
        calories: 120,
        preparationTime: 0,
        ingredients: 'Gazoz, Şeker, Doğal aromalar',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 3
      },
      {
        name: 'Sultan Elmalı Soda',
        description: 'Elmalı soda',
        price: 55,
        imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
        calories: 100,
        preparationTime: 0,
        ingredients: 'Soda, Elma aroması, Şeker',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 4
      },
      {
        name: 'Milk Tea / Mango / Harbi Çay',
        description: 'Sütlü çay, mango çayı veya harbi çay',
        price: 244,
        imageUrl: 'https://images.unsplash.com/photo-1576092762791-fd190a490058?w=800&q=80',
        calories: 180,
        preparationTime: 5,
        ingredients: 'Çay, Süt, Mango/Harbi aroması, Şeker',
        allergens: ['dairy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 5
      }
    ]
  },
  {
    category: {
      name: 'Ek Ücretler',
      description: 'Ek hizmetler ve ücretler',
      displayOrder: 7
    },
    products: [
      {
        name: 'Poşet',
        description: 'Taşıma poşeti',
        price: 0.50,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        calories: 0,
        preparationTime: 0,
        ingredients: 'Plastik poşet',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 1
      }
    ]
  }
];

async function addKrorenProducts() {
  if (KROREN_RESTAURANT_ID === 'KROREN_RESTAURANT_ID_BURAYA') {
    console.error('❌ HATA: Lütfen KROREN_RESTAURANT_ID değerini script içinde güncelleyin!');
    console.log('💡 İpucu: Restoran ID\'sini bulmak için API\'den restoranları listeleyebilirsiniz.');
    return;
  }

  console.log('🏪 Kroren Restoranı için kategori ve ürünler ekleniyor...');
  console.log(`📍 Restoran ID: ${KROREN_RESTAURANT_ID}\n`);
  
  let totalCategories = 0;
  let totalProducts = 0;
  let successCategories = 0;
  let successProducts = 0;

  try {
    for (const categoryData of categoriesWithProducts) {
      // 1. Kategori oluştur
      console.log(`📁 "${categoryData.category.name}" kategorisi oluşturuluyor...`);
      const categoryResponse = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData.category)
      });
      
      if (categoryResponse.ok) {
        const categoryResult = await categoryResponse.json();
        const categoryId = categoryResult.data.id;
        console.log(`✅ Kategori oluşturuldu: ${categoryData.category.name} (ID: ${categoryId})`);
        successCategories++;
        totalCategories++;
        
        // 2. Bu kategoriye ait ürünleri ekle
        console.log(`🍽️ "${categoryData.category.name}" kategorisine ${categoryData.products.length} ürün ekleniyor...`);
        for (const product of categoryData.products) {
          const productWithCategory = { 
            ...product, 
            categoryId,
            order: product.displayOrder
          };
          
          const response = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(productWithCategory)
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`  ✅ ${product.name} eklendi - Fiyat: ${product.price} TL, Kalori: ${product.calories}, Hazırlık: ${product.preparationTime} dk`);
            successProducts++;
            totalProducts++;
          } else {
            const errorText = await response.text();
            console.error(`  ❌ ${product.name} eklenemedi: ${response.status} - ${errorText}`);
            totalProducts++;
          }
          
          // API rate limiting için kısa bir bekleme
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        console.log('');
      } else {
        const errorText = await categoryResponse.text();
        console.error(`❌ Kategori oluşturulamadı: ${categoryResponse.status} - ${errorText}`);
        totalCategories++;
        console.log('');
      }
      
      // API rate limiting için kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n🎉 İşlem tamamlandı!');
    console.log(`📊 Özet:`);
    console.log(`   Kategoriler: ${successCategories}/${totalCategories} başarılı`);
    console.log(`   Ürünler: ${successProducts}/${totalProducts} başarılı`);
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// Restoran ID'sini bulmak için yardımcı fonksiyon
async function findRestaurantByName(restaurantName) {
  console.log(`🔍 "${restaurantName}" adlı restoran aranıyor...`);
  
  try {
    const response = await fetch(`${API_BASE}/restaurants?search=${encodeURIComponent(restaurantName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        console.log('✅ Restoran bulundu:');
        result.data.forEach(restaurant => {
          console.log(`   - ${restaurant.name} (ID: ${restaurant.id}, Username: ${restaurant.username})`);
        });
        return result.data;
      } else {
        console.log('❌ Restoran bulunamadı.');
        return null;
      }
    } else {
      console.log(`❌ Arama başarısız: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Hata:', error);
    return null;
  }
}

// Eğer script doğrudan çalıştırılırsa
if (require.main === module) {
  // İlk argüman "search" ise restoran ara
  if (process.argv[2] === 'search') {
    findRestaurantByName('Kroren');
  } else {
    addKrorenProducts();
  }
}

module.exports = { addKrorenProducts, findRestaurantByName };
