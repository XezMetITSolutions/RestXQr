const fetch = require('node-fetch');

async function checkProducts() {
  try {
    console.log('🔍 Checking Aksaray restaurant products...');
    
    const response = await fetch('https://masapp-backend.onrender.com/api/restaurants');
    const data = await response.json();
    
    const aksaray = data.data.find(r => r.username === 'aksaray');
    if (!aksaray) {
      console.log('❌ Aksaray restaurant not found');
      return;
    }
    
    console.log('✅ Aksaray Restaurant ID:', aksaray.id);
    
    const menuResponse = await fetch(`https://masapp-backend.onrender.com/api/restaurants/${aksaray.id}/menu/items`);
    const menuData = await menuResponse.json();
    
    console.log('📊 Total products:', menuData.data.length);
    
    const products = menuData.data;
    const productNames = products.map(p => p.name);
    const duplicates = productNames.filter((name, index) => productNames.indexOf(name) !== index);
    
    console.log('🔄 Duplicate product names:', [...new Set(duplicates)]);
    
    if (duplicates.length > 0) {
      console.log('\n📋 Duplicate products details:');
      const uniqueDuplicates = [...new Set(duplicates)];
      
      uniqueDuplicates.forEach(name => {
        const items = products.filter(p => p.name === name);
        console.log(`\n🔸 ${name}:`);
        items.forEach(item => {
          console.log(`  - ID: ${item.id}, Price: ${item.price}, Category: ${item.categoryId}`);
        });
      });
      
      // Duplicate IDs to remove (keep first one)
      const idsToRemove = [];
      uniqueDuplicates.forEach(name => {
        const items = products.filter(p => p.name === name);
        // Keep first one, remove others
        for (let i = 1; i < items.length; i++) {
          idsToRemove.push(items[i].id);
        }
      });
      
      console.log('\n🗑️ IDs to remove:', idsToRemove);
      
      if (idsToRemove.length > 0) {
        console.log('\n⚠️  Run remove_duplicates.js to remove these duplicates');
      }
    } else {
      console.log('✅ No duplicate products found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProducts();