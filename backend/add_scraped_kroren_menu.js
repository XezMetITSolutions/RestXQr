const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

const headers = {
    'Content-Type': 'application/json'
};

async function main() {
    // 1. Load scraped data
    const dataPath = path.join(__dirname, '../kroren_scraped_data.json');
    if (!fs.existsSync(dataPath)) {
        console.error('Data file not found:', dataPath);
        return;
    }
    const menuData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`Loaded ${menuData.categories.length} categories from file.`);

    // 2. Fetch existing categories to avoid duplicates
    let existingCategories = [];
    try {
        const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`);
        if (res.ok) {
            const json = await res.json();
            existingCategories = json.data || []; // Adjust based on actual API response structure
            console.log(`Fetched ${existingCategories.length} existing categories.`);
        } else {
            console.error('Failed to fetch existing categories:', await res.text());
        }
    } catch (e) {
        console.error('Error fetching categories:', e);
    }

    // Helper to find category by name
    const findCategory = (name) => existingCategories.find(c => c.name.toLowerCase() === name.toLowerCase());

    for (const cat of menuData.categories) {
        let categoryId;
        const existingCat = findCategory(cat.name);

        if (existingCat) {
            console.log(`Category "${cat.name}" already exists (ID: ${existingCat.id}). Using it.`);
            categoryId = existingCat.id;
        } else {
            console.log(`Creating category "${cat.name}"...`);
            // Create Category
            try {
                const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        name: cat.name,
                        description: '', // Scraper didn't capture category description easily, defaulting to empty
                        displayOrder: 0
                    })
                });

                if (res.ok) {
                    const json = await res.json();
                    categoryId = json.data.id;
                    console.log(`  -> Created ID: ${categoryId}`);
                } else {
                    console.error(`  -> Failed to create category:`, await res.text());
                    continue;
                }
            } catch (e) {
                console.error(`  -> Error creating category:`, e);
                continue;
            }
        }

        // 3. Process Items
        // Fetch existing items for this category to avoid duplicates
        let existingItems = [];
        try {
            const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items?categoryId=${categoryId}`);
            // Note: endpoint might differ, or we filter from a global list if needed.
            // Assumption: API might not support ?categoryId filter or returns all items.
            // Let's assume we can try to add, but maybe check by name? 
            // Better: List all items of the category if we can.
            // If the previous category fetch included items, we can use that. 
            // Based on add_kroren_products.js, it assumes we just POST. 

            // Safe approach: Check if product with same name exists in existingItems (from existingCat if available)
        } catch (e) { }

        // If existingCat has items populated (check API response structure if known, otherwise skip check or rely on server side check)
        if (existingCat && existingCat.items) {
            existingItems = existingCat.items;
        }

        for (const item of cat.items) {
            // Check if item exists in category
            const exists = existingItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
            if (exists) {
                console.log(`  Item "${item.name}" already exists. Skipping.`);

                // Optional: Update price/image if changed? For now, user asked to "add".
                continue;
            }

            console.log(`  Adding item "${item.name}" - ${item.price} TL`);
            try {
                const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        restaurantId: KROREN_RESTAURANT_ID,
                        categoryId: categoryId,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        imageUrl: item.imageUrl,
                        isAvailable: true,
                        isPopular: false,
                        displayOrder: 0 // Optional
                    })
                });

                if (res.ok) {
                    console.log(`    -> Success`);
                } else {
                    console.error(`    -> Failed:`, await res.text());
                }

                // Rate limit
                await new Promise(r => setTimeout(r, 200));

            } catch (e) {
                console.error(`    -> Error adding item:`, e);
            }
        }
    }
    console.log('Done.');
}

if (require.main === module) {
    main();
}
