const fs = require('fs');
const path = require('path');

const API_BASE = 'https://masapp-backend.onrender.com/api';
// Using the ID found in previous scripts
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

async function updateTranslations() {
    console.log('📖 Reading translations from JSON...');
    const translationsPath = path.join(__dirname, 'kroren_translations.json');
    if (!fs.existsSync(translationsPath)) {
        console.error('Translations file not found:', translationsPath);
        return;
    }
    const data = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

    console.log('🔄 Fetching existing categories and items...');
    let existingCategories = [];
    let existingItems = [];

    try {
        const catRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`);
        const itemRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`);

        if (catRes.ok) {
            const catData = await catRes.json();
            existingCategories = catData.data || [];
        }
        if (itemRes.ok) {
            const itemData = await itemRes.json();
            existingItems = itemData.data || [];
        }
    } catch (e) {
        console.error('Failed to fetch existing data:', e);
        return;
    }

    console.log(`✅ Found ${existingCategories.length} categories and ${existingItems.length} items.`);

    // Update Categories
    for (const group of data) {
        // Find category by Turkish Name (fuzzy match as it might be "Baslangiclar - Chinese")
        // User said "Turkcesi zaten su an Turkce-Cince".
        // So we look for a category that starts with the TR name from JSON.
        const catTrName = group.category;
        const targetCategory = existingCategories.find(c => c.name.toLowerCase().startsWith(catTrName.toLowerCase()));

        if (targetCategory) {
            // Construct new names
            const newTrName = `${group.category} - ${group.zh_category}`; // Ensure format
            const translations = {
                en: { name: `${group.en_category} - ${group.zh_category}`, description: targetCategory.translations?.en?.description || '' },
                zh: { name: group.zh_category, description: targetCategory.translations?.zh?.description || '' }
                // User didn't specify other languages, but we can set them if needed. 
                // For now, focusing on EN and ZH as requested.
            };

            // Update only if needed (check if TR name is different OR translations missing)
            // But user said "Turkcesi zaten su an Turkce-Cince", so we might just need to update translations.
            // Let's force update to ensure consistency.

            console.log(`Updating Category: ${targetCategory.name} -> ${newTrName} / EN: ${translations.en.name} / ZH: ${translations.zh.name}`);

            const payload = {
                name: newTrName, // Update main name to TR-ZH format
                description: targetCategory.description,
                order: targetCategory.order,
                isActive: targetCategory.isActive,
                kitchenStation: targetCategory.kitchenStation,
                translations: {
                    ...(targetCategory.translations || {}),
                    ...translations
                }
            };

            try {
                const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories/${targetCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) console.error(`Failed to update category ${targetCategory.name}: ${res.status}`);
            } catch (e) {
                console.error(`Error updating category ${targetCategory.name}:`, e);
            }
        } else {
            console.warn(`Category not found: ${catTrName}`);
        }

        // Update Items in this group
        for (const itemData of group.items) {
            // Find item by fuzzy match
            const itemTrName = itemData.tr;
            // Regex to match "Item Name" or "Item Name - Chinese"
            const targetItem = existingItems.find(i => i.name.toLowerCase().includes(itemTrName.toLowerCase()));

            if (targetItem) {
                const newTrName = `${itemTrName} - ${itemData.zh}`;
                const translations = {
                    en: { name: `${itemData.en} - ${itemData.zh}`, description: targetItem.translations?.en?.description || '' },
                    zh: { name: itemData.zh, description: targetItem.translations?.zh?.description || '' }
                };

                console.log(`Updating Item: ${targetItem.name} -> ${newTrName} / EN: ${translations.en.name} / ZH: ${translations.zh.name}`);

                const payload = {
                    categoryId: targetItem.categoryId,
                    name: newTrName, // Ensure TR-ZH format
                    description: targetItem.description, // Keep existing description (which might be updated by other script)
                    price: targetItem.price,
                    imageUrl: targetItem.imageUrl,
                    isAvailable: targetItem.isAvailable,
                    isPopular: targetItem.isPopular,
                    kitchenStation: targetItem.kitchenStation,
                    translations: {
                        ...(targetItem.translations || {}),
                        ...translations
                    }
                };

                try {
                    const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items/${targetItem.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!res.ok) console.error(`Failed to update item ${targetItem.name}: ${res.status}`);
                } catch (e) {
                    console.error(`Error updating item ${targetItem.name}:`, e);
                }

                // Rate limit helper
                await new Promise(r => setTimeout(r, 50));
            } else {
                console.warn(`Item not found: ${itemTrName}`);
            }
        }
    }
    console.log('🎉 Done updating translations!');
}

updateTranslations();
