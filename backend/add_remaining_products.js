// Test Restoran için kalan ürünleri ekleme scripti
const API_BASE = 'https://masapp-backend.onrender.com/api';
const TEST_RESTAURANT_ID = '714f6e03-4496-4a1e-981f-2ee9d35a9e75';
const CATEGORY_ID = '2748918e-2d30-42db-aa16-67e413313ff4';

// Kalan ürünler
const remainingProducts = [
  {
    name: 'Tavuk Şiş',
    description: 'Marine edilmiş tavuk göğsü şiş',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400',
    displayOrder: 3
  },
  {
    name: 'Kuzu Pirzola',
    description: 'Izgara kuzu pirzola',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    displayOrder: 4
  },
  {
    name: 'Mercimek Çorbası',
    description: 'Ev yapımı mercimek çorbası',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    displayOrder: 5
  },
  {
    name: 'Yayla Çorbası',
    description: 'Yoğurtlu yayla çorbası',
    price: 28,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    displayOrder: 6
  },
  {
    name: 'Ayran',
    description: 'Ev yapımı ayran',
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    displayOrder: 7
  },
  {
    name: 'Çay',
    description: 'Türk çayı',
    price: 8,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    displayOrder: 8
  },
  {
    name: 'Baklava',
    description: 'Ev yapımı baklava',
    price: 35,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    displayOrder: 9
  },
  {
    name: 'Sütlaç',
    description: 'Ev yapımı sütlaç',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    displayOrder: 10
  }
];

// Ürünleri ekleme fonksiyonu
async function addRemainingProducts() {
  console.log('🍽️ Kalan ürünler ekleniyor...');
  
  for (const product of remainingProducts) {
    try {
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: CATEGORY_ID,
        imageUrl: product.imageUrl,
        isActive: true,
        isAvailable: true,
        displayOrder: product.displayOrder
      };
      
      const response = await fetch(`${API_BASE}/restaurants/${TEST_RESTAURANT_ID}/menu/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
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
addRemainingProducts();

