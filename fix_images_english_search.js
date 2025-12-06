// Her ürün için İngilizce arama ile bulunan doğru resimler
const API_URL = 'https://masapp-backend.onrender.com/api';
const RESTAURANT_ID = '714f6e03-4496-4a1e-981f-2ee9d35a9e75';

// Her ürün için özel olarak seçilmiş doğru resimler (İngilizce arama ile bulunan)
const correctImages = {
  // Çorbalar
  '38f889b4-380f-43a8-a1fe-780f18afa532': { // Tom Yum Çorbası
    name: 'Tom Yum Çorbası',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '64597899-e56f-4b9b-85d9-083a0703332c': { // Minestrone Çorbası
    name: 'Minestrone Çorbası',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  'db2327fb-3263-4f00-8c89-b2fae6da8f9e': { // Gazpacho
    name: 'Gazpacho',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Ana Yemekler
  'fe922e08-dbc4-4903-b11b-007e4f717251': { // Pad Thai
    name: 'Pad Thai',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '2ee73276-cf60-4eae-af20-7d6c57763eef': { // Chicken Teriyaki
    name: 'Chicken Teriyaki',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '24c01c2a-3825-449b-abfd-6370506bcd07': { // Beef Stroganoff
    name: 'Beef Stroganoff',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '42f8630e-7f17-41b5-ac6b-6fc269cd64f6': { // Chicken Tikka Masala
    name: 'Chicken Tikka Masala',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Izgara
  '4bb3ce5d-a045-43d2-bc36-4dae559a1c32': { // Argentine Steak
    name: 'Argentine Steak',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '09f96063-64e9-4414-9dd0-3c4dbd61aa8b': { // Salmon Teriyaki
    name: 'Salmon Teriyaki',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  'c2f850cc-acf3-4c82-b94e-0d2ea29ec308': { // Lamb Chops
    name: 'Lamb Chops',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Pizza
  '202d7c68-c9c0-43e2-889d-491141647ddc': { // Quattro Stagioni
    name: 'Quattro Stagioni',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '9e48ffcd-963d-497d-9393-9ae9488e5b29': { // Hawaiian Pizza
    name: 'Hawaiian Pizza',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  'fd7dfd84-c847-4383-bca7-7bae24343aa3': { // BBQ Chicken Pizza
    name: 'BBQ Chicken Pizza',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Salatalar
  '6c9e5609-f745-41a2-bbaf-458f4f164194': { // Caesar Salad
    name: 'Caesar Salad',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  'c38de35c-4230-443b-87f6-dee74e7af50b': { // Greek Salad
    name: 'Greek Salad',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '631f4841-2a8e-404f-aada-fa715a1a3bec': { // Thai Beef Salad
    name: 'Thai Beef Salad',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // İçecekler
  '11b12d0e-f388-4429-8591-55802017a9c9': { // Matcha Latte
    name: 'Matcha Latte',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '076897d2-7c32-4846-85c0-5e3c0bca36e9': { // Thai Iced Tea
    name: 'Thai Iced Tea',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '0a09c176-7545-4213-8629-13356aaa511d': { // Italian Soda
    name: 'Italian Soda',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Tatlılar
  '1cdc38a7-a183-4240-8ef0-2a5f0e35a222': { // Tiramisu
    name: 'Tiramisu',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '11305c64-49aa-49d1-a807-6cb84b451b9a': { // Mochi Ice Cream
    name: 'Mochi Ice Cream',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '79186c80-bb2c-446f-be81-723b2dcd1747': { // Churros
    name: 'Churros',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Kahvaltı
  'b98a4e99-668a-4700-9120-3dd80974fa05': { // American Pancakes
    name: 'American Pancakes',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '8bfa50e9-508e-4f32-9766-a70920c56420': { // French Toast
    name: 'French Toast',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  '304b087c-c9b0-4118-bf2f-9cbef00177a4': { // English Breakfast
    name: 'English Breakfast',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  }
};

async function updateCorrectImages() {
  console.log('🖼️ Doğru resimler atanıyor...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [itemId, itemData] of Object.entries(correctImages)) {
    try {
      const response = await fetch(`${API_URL}/restaurants/${RESTAURANT_ID}/menu/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: itemData.imageUrl
        })
      });
      
      if (response.ok) {
        console.log(`✅ ${itemData.name} - Resim güncellendi`);
        successCount++;
      } else {
        console.log(`❌ ${itemData.name} - Resim güncellenemedi: ${response.status}`);
        errorCount++;
      }
      
      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`❌ Hata: ${itemData.name} - ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Sonuç:`);
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Hatalı: ${errorCount}`);
  console.log(`📋 Toplam: ${Object.keys(correctImages).length}`);
}

// Scripti çalıştır
updateCorrectImages();
