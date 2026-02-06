const fs = require('fs');
const path = require('path');

const API_BASE = 'https://masapp-backend.onrender.com/api';
const WRONG_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

async function main() {
    // 1. Load scraped data to know what we added
    const dataPath = path.join(__dirname, '../kroren_scraped_data.json');
    if (!fs.existsSync(dataPath)) {
        console.error('Data file not found');
        return;
    }
    const menuData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Collect all item names we want to remove
    const itemsToRemove = new Set();
    const categoriesToCheck = new Set();

    menuData.categories.forEach(c => {
        categoriesToCheck.add(c.name);
        c.items.forEach(i => itemsToRemove.add(i.name.toLowerCase().trim()));
    });

    console.log(`Found ${itemsToRemove.size} unique items to check for removal.`);

    // 2. Fetch all current items from the wrong restaurant
    // Note: The API usually returns all items or we iterate categories.
    // Let's fetch categories first, then items for each category.

    try {
        const catRes = await fetch(`${API_BASE}/restaurants/${WRONG_RESTAURANT_ID}/menu/categories`);
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        const categories = (await catRes.json()).data;

        console.log(`Scanning ${categories.length} categories in the restaurant...`);

        for (const cat of categories) {
            // Fetch items for this category
            const itemRes = await fetch(`${API_BASE}/restaurants/${WRONG_RESTAURANT_ID}/menu/items?categoryId=${cat.id}`);
            if (!itemRes.ok) {
                console.error(`Failed to fetch items for category ${cat.name}`);
                continue;
            }
            const items = (await itemRes.json()).data || [];

            for (const item of items) {
                if (itemsToRemove.has(item.name.toLowerCase().trim())) {
                    console.log(`Deleting item: ${item.name} (ID: ${item.id})`);

                    const delRes = await fetch(`${API_BASE}/restaurants/${WRONG_RESTAURANT_ID}/menu/items/${item.id}`, {
                        method: 'DELETE'
                    });

                    if (delRes.ok) {
                        console.log(`  -> Deleted.`);
                    } else {
                        console.error(`  -> Failed to delete: ${await delRes.text()}`);
                    }
                    // Rate limit
                    await new Promise(r => setTimeout(r, 100));
                }
            }

            // Optional: If category is empty and one of ours, delete it?
            // Checking if empty might require refetching or tracking count.
            // Given the user instructions, deleting items is the priority. 
            // Deleting categories might be risky if they existed before.
            // I'll skip deleting categories to be safe, unless requested.
        }

    } catch (e) {
        console.error('Error:', e);
    }
    console.log('Cleanup complete.');
}

main();
