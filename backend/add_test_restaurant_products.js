const API_BASE = 'https://masapp-backend.onrender.com/api';
const TEST_RESTAURANT_ID = 'ba206425-981f-4c1b-ba4f-4046faaad4b5'; // Test Restoran ID

// Önce kategori oluştur
const category = {
  name: 'Ana Yemekler',
  description: 'Geleneksel Türk yemekleri',
  displayOrder: 1
};

// Test ürünleri
const testProducts = [
  {
    name: 'Adana Kebap',
    description: 'Acılı kıyma ile hazırlanan geleneksel Adana kebap',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    allergens: ['gluten'],
    ingredients: ['Kıyma', 'Soğan', 'Biber', 'Baharatlar'],
    nutritionInfo: { calories: 450, protein: 30, fat: 25, carbs: 15 },
    isAvailable: true,
    displayOrder: 1
  },
  {
    name: 'Urfa Kebap',
    description: 'Acısız kıyma ile hazırlanan geleneksel Urfa kebap',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    allergens: ['gluten'],
    ingredients: ['Kıyma', 'Soğan', 'Biber', 'Baharatlar'],
    nutritionInfo: { calories: 450, protein: 30, fat: 25, carbs: 15 },
    isAvailable: true,
    displayOrder: 2
  },
  {
    name: 'Tavuk Şiş',
    description: 'Marine edilmiş tavuk şiş, ızgarada pişirilmiş',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1593560704563-f12a66c6e1d0?w=400',
    allergens: [],
    ingredients: ['Tavuk göğsü', 'Yoğurt', 'Baharatlar'],
    nutritionInfo: { calories: 350, protein: 40, fat: 15, carbs: 10 },
    isAvailable: true,
    displayOrder: 3
  },
  {
    name: 'Kuzu Pirzola',
    description: 'Özel baharatlarla marine edilmiş kuzu pirzola',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    allergens: [],
    ingredients: ['Kuzu pirzola', 'Zeytinyağı', 'Kekik'],
    nutritionInfo: { calories: 600, protein: 45, fat: 40, carbs: 5 },
    isAvailable: true,
    displayOrder: 4
  },
  {
    name: 'Mercimek Çorbası',
    description: 'Geleneksel kırmızı mercimek çorbası',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1589182371002-dc36b7157507?w=400',
    allergens: ['gluten'],
    ingredients: ['Kırmızı mercimek', 'Nane', 'Pul biber'],
    nutritionInfo: { calories: 200, protein: 10, fat: 8, carbs: 25 },
    isAvailable: true,
    displayOrder: 5
  },
  {
    name: 'Yayla Çorbası',
    description: 'Yoğurtlu ve naneli ferahlatıcı yayla çorbası',
    price: 28,
    imageUrl: 'https://images.unsplash.com/photo-1589182371002-dc36b7157507?w=400',
    allergens: ['süt'],
    ingredients: ['Yoğurt', 'Pirinç', 'Nane'],
    nutritionInfo: { calories: 220, protein: 12, fat: 10, carbs: 20 },
    isAvailable: true,
    displayOrder: 6
  },
  {
    name: 'Ayran',
    description: 'Geleneksel Türk içeceği',
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1625220194771-7ea5395734fa?w=400',
    allergens: ['süt'],
    ingredients: ['Yoğurt', 'Su', 'Tuz'],
    nutritionInfo: { calories: 80, protein: 5, fat: 3, carbs: 8 },
    isAvailable: true,
    displayOrder: 7
  },
  {
    name: 'Çay',
    description: 'Sıcak ve taze demlenmiş Türk çayı',
    price: 8,
    imageUrl: 'https://images.unsplash.com/photo-1576092762791-fd190a490058?w=400',
    allergens: [],
    ingredients: ['Siyah çay', 'Su'],
    nutritionInfo: { calories: 0, protein: 0, fat: 0, carbs: 0 },
    isAvailable: true,
    displayOrder: 8
  },
  {
    name: 'Baklava',
    description: 'Antep fıstıklı geleneksel Türk tatlısı',
    price: 35,
    imageUrl: 'https://images.unsplash.com/photo-1599025265841-b041940d012b?w=400',
    allergens: ['gluten', 'fıstık'],
    ingredients: ['Yufka', 'Antep fıstığı', 'Şerbet'],
    nutritionInfo: { calories: 500, protein: 8, fat: 30, carbs: 55 },
    isAvailable: true,
    displayOrder: 9
  },
  {
    name: 'Sütlaç',
    description: 'Fırın sütlaç, geleneksel Türk tatlısı',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1587899886239-5733120751c9?w=400',
    allergens: ['süt'],
    ingredients: ['Süt', 'Pirinç', 'Şeker'],
    nutritionInfo: { calories: 300, protein: 10, fat: 10, carbs: 40 },
    isAvailable: true,
    displayOrder: 10
  }
];

async function addTestRestaurantProducts() {
  console.log('🏪 Test Restoran için kategori ve ürünler ekleniyor...');
  
  try {
    // 1. Kategori oluştur
    console.log('📁 Kategori oluşturuluyor...');
    const categoryResponse = await fetch(`${API_BASE}/restaurants/${TEST_RESTAURANT_ID}/menu/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category)
    });
    
    if (categoryResponse.ok) {
      const categoryResult = await categoryResponse.json();
      console.log('✅ Kategori oluşturuldu:', categoryResult.data.name);
      const categoryId = categoryResult.data.id;
      
      // 2. Ürünleri ekle
      console.log('🍽️ Ürünler ekleniyor...');
      for (const product of testProducts) {
        const productWithCategory = { ...product, categoryId };
        
        const response = await fetch(`${API_BASE}/restaurants/${TEST_RESTAURANT_ID}/menu/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productWithCategory)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${product.name} eklendi - ID: ${result.data.id}`);
        } else {
          console.error(`❌ ${product.name} eklenemedi: ${response.status}`);
        }
      }
      console.log('🎉 Tüm ürünler eklendi!');
      console.log(`🌐 Test Restoran URL: https://testrestoran.restxqr.com/menu/`);
    } else {
      console.error('❌ Kategori oluşturulamadı:', categoryResponse.status);
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

addTestRestaurantProducts();
