/**
 * Script to update product images with correct food images
 * Updates all menu items in Aksaray restaurant with appropriate images
 */

const API_BASE_URL = 'https://masapp-backend.onrender.com/api';

// Mapping of product names to appropriate food images
const productImageMap = {
  // Çorbalar (Soups)
  'Mercimek Çorbası': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', // Lentil soup
  'Ezogelin Çorbası': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', // Turkish soup
  'Tavuk Çorbası': 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop', // Chicken soup

  // Ana Yemekler (Main Dishes)
  'Karnıyarık': 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=400&h=300&fit=crop', // Stuffed eggplant
  'Mantı': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', // Turkish dumplings
  'Etli Pilav': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop', // Rice with meat

  // Izgara (Grilled)
  'Adana Kebap': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop', // Adana kebab
  'Urfa Kebap': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', // Urfa kebab
  'Tavuk Şiş': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', // Chicken shish

  // Pizza
  'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', // Margherita pizza
  'Pepperoni Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', // Pepperoni pizza
  'Karışık Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', // Mixed pizza

  // Salatalar (Salads)
  'Çoban Salata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', // Shepherd salad
  'Mevsim Salata': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', // Season salad
  'Tavuk Salata': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', // Chicken salad

  // İçecekler (Beverages)
  'Ayran': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', // Ayran
  'Türk Kahvesi': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', // Turkish coffee
  'Çay': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', // Turkish tea
  'Kola': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop', // Cola

  // Tatlılar (Desserts)
  'Baklava': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', // Baklava
  'Künefe': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop', // Kunefe
  'Sütlaç': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', // Rice pudding

  // Kahvaltı (Breakfast)
  'Serpme Kahvaltı': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', // Turkish breakfast
  'Menemen': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop', // Menemen
  'Omlet': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop' // Omelet
};

async function updateProductImages() {
  try {
    console.log('🔄 Starting product image update...');
    
    // Get restaurant data
    const response = await fetch(`${API_BASE_URL}/restaurants/username/aksaray`);
    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Failed to fetch restaurant data');
    }

    const restaurant = data.data;
    let updatedCount = 0;
    let totalCount = 0;

    console.log(`🏪 Restaurant: ${restaurant.name}`);
    console.log(`📋 Categories: ${restaurant.categories.length}`);

    // Process each category
    for (const category of restaurant.categories) {
      console.log(`\n📂 Processing category: ${category.name}`);
      
      for (const item of category.items) {
        totalCount++;
        const productName = item.name;
        const newImageUrl = productImageMap[productName];
        
        if (newImageUrl && item.imageUrl !== newImageUrl) {
          console.log(`🔄 Updating: ${productName}`);
          console.log(`   Old: ${item.imageUrl}`);
          console.log(`   New: ${newImageUrl}`);
          
          // Update the item image using correct endpoint
          const updateResponse = await fetch(`${API_BASE_URL}/restaurants/${restaurant.id}/menu/items/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: newImageUrl
            })
          });

          if (updateResponse.ok) {
            updatedCount++;
            console.log(`   ✅ Updated successfully`);
          } else {
            console.log(`   ❌ Failed to update`);
          }
          
          // Add small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        } else if (newImageUrl) {
          console.log(`✅ ${productName} - Already has correct image`);
        } else {
          console.log(`⚠️  ${productName} - No image mapping found`);
        }
      }
    }

    console.log(`\n🎉 Update completed!`);
    console.log(`📊 Total products: ${totalCount}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped: ${totalCount - updatedCount}`);

  } catch (error) {
    console.error('❌ Error updating product images:', error);
  }
}

// Alternative function to update via direct database if API doesn't support PUT
async function updateProductImagesDirectly() {
  try {
    console.log('🔄 Starting direct product image update...');
    
    const updates = [];
    
    // Get restaurant data
    const response = await fetch(`${API_BASE_URL}/restaurants/username/aksaray`);
    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Failed to fetch restaurant data');
    }

    const restaurant = data.data;
    
    // Collect all updates needed
    for (const category of restaurant.categories) {
      for (const item of category.items) {
        const newImageUrl = productImageMap[item.name];
        if (newImageUrl && item.imageUrl !== newImageUrl) {
          updates.push({
            id: item.id,
            name: item.name,
            oldImage: item.imageUrl,
            newImage: newImageUrl
          });
        }
      }
    }

    console.log(`📋 Found ${updates.length} items to update:`);
    updates.forEach(update => {
      console.log(`- ${update.name}: ${update.id}`);
    });

    // You can use this data to manually update the database
    // or create a batch update endpoint
    return updates;

  } catch (error) {
    console.error('❌ Error preparing updates:', error);
  }
}

// Run the update
if (typeof window === 'undefined') {
  // Node.js environment
  updateProductImages();
} else {
  // Browser environment
  console.log('Run updateProductImages() in browser console');
  window.updateProductImages = updateProductImages;
  window.updateProductImagesDirectly = updateProductImagesDirectly;
}
