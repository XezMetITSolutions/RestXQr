const API_BASE = 'https://masapp-backend.onrender.com/api';
const TEST_RESTAURANT_ID = 'ba206425-981f-4c1b-ba4f-4046faaad4b5';
const CATEGORY_ID = 'ffcf7b6d-5f28-4966-83d5-eb9d72314df4';

// Basit format ile test ürünleri
const testProducts = [
  {
    name: 'Adana Kebap',
    description: 'Acılı kıyma ile hazırlanan geleneksel Adana kebap',
    price: 85,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Urfa Kebap',
    description: 'Acısız kıyma ile hazırlanan geleneksel Urfa kebap',
    price: 85,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Tavuk Şiş',
    description: 'Marine edilmiş tavuk şiş, ızgarada pişirilmiş',
    price: 75,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Kuzu Pirzola',
    description: 'Özel baharatlarla marine edilmiş kuzu pirzola',
    price: 120,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Mercimek Çorbası',
    description: 'Geleneksel kırmızı mercimek çorbası',
    price: 25,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Yayla Çorbası',
    description: 'Yoğurtlu ve naneli ferahlatıcı yayla çorbası',
    price: 28,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Ayran',
    description: 'Geleneksel Türk içeceği',
    price: 15,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Çay',
    description: 'Sıcak ve taze demlenmiş Türk çayı',
    price: 8,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Baklava',
    description: 'Antep fıstıklı geleneksel Türk tatlısı',
    price: 35,
    categoryId: CATEGORY_ID,
    isAvailable: true
  },
  {
    name: 'Sütlaç',
    description: 'Fırın sütlaç, geleneksel Türk tatlısı',
    price: 25,
    categoryId: CATEGORY_ID,
    isAvailable: true
  }
];

async function addSimpleProducts() {
  console.log('🍽️ Test Restoran için basit ürünler ekleniyor...');
  
  for (const product of testProducts) {
    try {
      const response = await fetch(`${API_BASE}/restaurants/${TEST_RESTAURANT_ID}/menu/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${product.name} eklendi - ID: ${result.data.id}`);
      } else {
        console.error(`❌ ${product.name} eklenemedi: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${product.name} eklenirken hata:`, error);
    }
  }
  console.log('🎉 Tüm ürünler eklendi!');
  console.log(`🌐 Test Restoran URL: https://testrestoran.restxqr.com/menu/`);
}

addSimpleProducts();
