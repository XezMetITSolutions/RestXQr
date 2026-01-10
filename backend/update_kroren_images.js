const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

// Ürün isimleri ve Unsplash görsel URL'leri
const productImages = {
  // Makarnalar & Noodle
  'Ganbian Makarnası': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  'Sebzeli Noodle': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  'Tavuk Noodle': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  'Dana Noodle': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  
  // Tavuk Yemekleri
  'Acılı Lokum Tavuk': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
  'Portakallı Çıtır Tavuk': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
  'Tatlı Ekşi Tavuk': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
  
  // Ana Yemekler
  'Buharda Mantı': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  'Dana Etli Rojamo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'Özel Soslu Tofu': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
  
  // Yan Ürünler
  'Sade Pilav': 'https://images.unsplash.com/photo-1589301760014-4c5c0e5e0a5e?w=800&q=80',
  'Karides Krakeri / Cips': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
  'Buharda Sade Ekmek': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  
  // Salatalar
  'Erişteli Salata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  
  // İçecekler
  'Su (50 cl)': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
  'Kutu İçecekler': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
  'Niğde Gazozu': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
  'Sultan Elmalı Soda': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
  'Milk Tea / Mango / Harbi Çay': 'https://images.unsplash.com/photo-1576092762791-fd190a490058?w=800&q=80',
  
  // Ek Ücretler
  'Poşet': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
};

async function getMenuItems() {
  try {
    const response = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.data || [];
    } else {
      console.error(`❌ Menü öğeleri alınamadı: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Hata:', error);
    return [];
  }
}

async function updateMenuItemImage(itemId, imageUrl, currentItem) {
  try {
    // Mevcut item verilerini koruyarak sadece imageUrl'i güncelle
    const updateData = {
      name: currentItem.name,
      description: currentItem.description,
      price: currentItem.price,
      imageUrl: imageUrl,
      categoryId: currentItem.categoryId,
      displayOrder: currentItem.displayOrder,
      isAvailable: currentItem.isAvailable !== undefined ? currentItem.isAvailable : true
    };
    
    const response = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   API Hatası: ${response.status} - ${errorText}`);
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Hata:', error);
    return false;
  }
}

async function updateKrorenImages() {
  console.log('🖼️ Kroren restoranı ürün görselleri güncelleniyor...\n');
  
  const menuItems = await getMenuItems();
  
  if (menuItems.length === 0) {
    console.log('❌ Menü öğesi bulunamadı.');
    return;
  }
  
  console.log(`📋 ${menuItems.length} ürün bulundu.\n`);
  
  let updated = 0;
  let notFound = 0;
  
  for (const item of menuItems) {
    const imageUrl = productImages[item.name];
    
    if (imageUrl) {
      const success = await updateMenuItemImage(item.id, imageUrl, item);
      if (success) {
        console.log(`✅ ${item.name} - Görsel güncellendi`);
        updated++;
      } else {
        console.log(`❌ ${item.name} - Görsel güncellenemedi`);
      }
    } else {
      console.log(`⚠️  ${item.name} - Görsel URL bulunamadı`);
      notFound++;
    }
    
    // API rate limiting için kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n🎉 İşlem tamamlandı!`);
  console.log(`📊 Özet:`);
  console.log(`   Güncellenen: ${updated}`);
  console.log(`   Görsel bulunamayan: ${notFound}`);
}

updateKrorenImages();
