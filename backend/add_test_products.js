// Test Restoran için ürünler ekleme scripti
const API_BASE = 'https://masapp-backend.onrender.com/api';

// Test Restoran ID'si (admin panelinden alınacak)
const TEST_RESTAURANT_ID = '714f6e03-4496-4a1e-981f-2ee9d35a9e75'; // Aksaray restaurant ID

// Test ürünleri
const testProducts = [
  {
    name: 'Adana Kebap',
    description: 'Acılı kıyma ile hazırlanan geleneksel Adana kebap',
    price: 85,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    allergens: ['gluten'],
    ingredients: ['Kıyma', 'Soğan', 'Biber', 'Baharatlar'],
    nutritionInfo: {
      calories: 450,
      protein: 35,
      carbs: 15,
      fat: 25
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 1
  },
  {
    name: 'Urfa Kebap',
    description: 'Acısız kıyma ile hazırlanan Urfa kebap',
    price: 85,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
    allergens: ['gluten'],
    ingredients: ['Kıyma', 'Soğan', 'Baharatlar'],
    nutritionInfo: {
      calories: 420,
      protein: 32,
      carbs: 12,
      fat: 22
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 2
  },
  {
    name: 'Tavuk Şiş',
    description: 'Marine edilmiş tavuk göğsü şiş',
    price: 75,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400',
    allergens: [],
    ingredients: ['Tavuk göğsü', 'Zeytinyağı', 'Baharatlar'],
    nutritionInfo: {
      calories: 320,
      protein: 45,
      carbs: 8,
      fat: 12
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 3
  },
  {
    name: 'Kuzu Pirzola',
    description: 'Izgara kuzu pirzola',
    price: 120,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    allergens: [],
    ingredients: ['Kuzu eti', 'Zeytinyağı', 'Baharatlar'],
    nutritionInfo: {
      calories: 380,
      protein: 38,
      carbs: 5,
      fat: 22
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 4
  },
  {
    name: 'Mercimek Çorbası',
    description: 'Ev yapımı mercimek çorbası',
    price: 25,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    allergens: ['gluten'],
    ingredients: ['Mercimek', 'Soğan', 'Havuç', 'Patates'],
    nutritionInfo: {
      calories: 180,
      protein: 12,
      carbs: 25,
      fat: 3
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 5
  },
  {
    name: 'Yayla Çorbası',
    description: 'Yoğurtlu yayla çorbası',
    price: 28,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    allergens: ['gluten', 'dairy'],
    ingredients: ['Yoğurt', 'Pirinç', 'Nane', 'Baharatlar'],
    nutritionInfo: {
      calories: 160,
      protein: 8,
      carbs: 22,
      fat: 4
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 6
  },
  {
    name: 'Ayran',
    description: 'Ev yapımı ayran',
    price: 15,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    allergens: ['dairy'],
    ingredients: ['Yoğurt', 'Su', 'Tuz'],
    nutritionInfo: {
      calories: 60,
      protein: 4,
      carbs: 6,
      fat: 2
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 7
  },
  {
    name: 'Çay',
    description: 'Türk çayı',
    price: 8,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    allergens: [],
    ingredients: ['Çay yaprağı', 'Su'],
    nutritionInfo: {
      calories: 2,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 8
  },
  {
    name: 'Baklava',
    description: 'Ev yapımı baklava',
    price: 35,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    allergens: ['gluten', 'nuts'],
    ingredients: ['Yufka', 'Ceviz', 'Şeker şurubu'],
    nutritionInfo: {
      calories: 320,
      protein: 6,
      carbs: 45,
      fat: 14
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 9
  },
  {
    name: 'Sütlaç',
    description: 'Ev yapımı sütlaç',
    price: 25,
    categoryId: '2748918e-2d30-42db-aa16-67e413313ff4', // Avokado kategorisi
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    allergens: ['dairy'],
    ingredients: ['Süt', 'Pirinç', 'Şeker'],
    nutritionInfo: {
      calories: 180,
      protein: 6,
      carbs: 28,
      fat: 4
    },
    isActive: true,
    isAvailable: true,
    displayOrder: 10
  }
];

// Ürünleri ekleme fonksiyonu
async function addProducts() {
  console.log('🍽️ Test Restoran için ürünler ekleniyor...');
  
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
        console.error(`❌ ${product.name} eklenemedi:`, response.status);
      }
    } catch (error) {
      console.error(`❌ ${product.name} eklenirken hata:`, error);
    }
  }
  
  console.log('🎉 Tüm ürünler eklendi!');
}

// Scripti çalıştır
addProducts();
