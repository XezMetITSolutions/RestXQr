const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = 'https://masapp-backend.onrender.com/api';
// Kroren-Kayseri ID (Corrected based on findings)
const KROREN_KAYSERI_ID = '560b0683-2523-4c34-b7a4-8e80a6118770';

const headers = {
    'Content-Type': 'application/json'
};

async function main() {
    // 1. Load scraped data
    const dataPath = path.join(__dirname, 'kroren_kayseri_scraped.json');
    if (!fs.existsSync(dataPath)) {
        console.error('Data file not found:', dataPath);
        return;
    }
    const menuData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`Loaded ${menuData.categories.length} categories from file.`);

    // 2. Fetch existing categories to avoid duplicates
    let existingCategories = [];
    try {
        const res = await fetch(`${API_BASE}/restaurants/${KROREN_KAYSERI_ID}/menu/categories`);
        if (res.ok) {
            const json = await res.json();
            existingCategories = json.data || [];
            console.log(`Fetched ${existingCategories.length} existing categories.`);
        } else {
            console.error('Failed to fetch existing categories:', await res.text());
        }
    } catch (e) {
        console.error('Error fetching categories:', e);
    }

    const findCategory = (name) => existingCategories.find(c => c.name.toLowerCase() === name.toLowerCase());

    for (const cat of menuData.categories) {
        let categoryId;
        const existingCat = findCategory(cat.name);

        if (existingCat) {
            console.log(`Category "${cat.name}" already exists (ID: ${existingCat.id}).`);
            categoryId = existingCat.id;
        } else {
            console.log(`Creating category "${cat.name}"...`);
            try {
                const res = await fetch(`${API_BASE}/restaurants/${KROREN_KAYSERI_ID}/menu/categories`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        name: cat.name,
                        description: '',
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

        // 3. Fetch existing items for this category to avoid duplicates
        let existingItems = [];
        try {
            const res = await fetch(`${API_BASE}/restaurants/${KROREN_KAYSERI_ID}/menu/items?categoryId=${categoryId}`);
            if (res.ok) {
                const json = await res.json();
                existingItems = json.data || [];
            }
        } catch (e) { }

        for (const item of cat.items) {
            const exists = existingItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
            if (exists) {
                console.log(`  Item "${item.name}" already exists. Skipping.`);
                continue;
            }

            console.log(`  Adding item "${item.name}" - ${item.price} TL`);
            try {
                const res = await fetch(`${API_BASE}/restaurants/${KROREN_KAYSERI_ID}/menu/items`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        restaurantId: KROREN_KAYSERI_ID,
                        categoryId: categoryId,
                        name: item.name,
                        description: item.description || '',
                        price: item.price,
                        imageUrl: item.imageUrl,
                        isAvailable: true,
                        isPopular: false,
                        displayOrder: 0
                    })
                });

                if (res.ok) {
                    console.log(`    -> Success`);
                } else {
                    console.error(`    -> Failed:`, await res.text());
                }

                // Small rate limit delay
                await new Promise(r => setTimeout(r, 150));

            } catch (e) {
                console.error(`    -> Error adding item:`, e);
            }
        }
    }
    console.log('Migration completed successfully.');
}

main();
