const fs = require('fs');
const path = require('path');

const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fixMenu() {
    console.log('📖 Reading translations from JSON...');
    const jsonPath = path.join(__dirname, 'kroren_translations.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('JSON file not found!');
        return;
    }
    const mapping = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log('🔄 Fetching detailed menu...');
    const [catRes, itemRes] = await Promise.all([
        fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`),
        fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`)
    ]);

    if (!catRes.ok || !itemRes.ok) {
        console.error('API Error');
        return;
    }

    const categories = (await catRes.json()).data || [];
    const items = (await itemRes.json()).data || [];

    // --- Fix Categories ---
    for (const group of mapping) {
        // Find category by matching the unique Turkish part "Başlangıçlar" from "Başlangıçlar - Something"
        const target = categories.find(c => c.name.toLowerCase().includes(group.category.toLowerCase()));

        if (target) {
            const trFinal = `${group.category} - ${group.zh_category}`; // Turkish - Chinese
            const enFinal = `${group.en_category} - ${group.zh_category}`; // English - Chinese
            const zhFinal = group.zh_category; // Chinese

            console.log(`🔧 Fixing Category: ${group.category}`);
            console.log(`   TR: ${trFinal}`);
            console.log(`   EN: ${enFinal}`);
            console.log(`   ZH: ${zhFinal}`);

            await updateCategory(target.id, {
                name: trFinal,
                translations: {
                    ...(target.translations || {}),
                    tr: { name: trFinal, description: target.translations?.tr?.description || target.description },
                    en: { name: enFinal, description: target.translations?.en?.description || '' },
                    zh: { name: zhFinal, description: target.translations?.zh?.description || '' }
                }
            });
        }

        // --- Fix Items ---
        for (const itemMap of group.items) {
            // Find item
            const targetItem = items.find(i => i.name.toLowerCase().includes(itemMap.tr.toLowerCase()));

            if (targetItem) {
                const trFinal = `${itemMap.tr} - ${itemMap.zh}`;
                const enFinal = `${itemMap.en} - ${itemMap.zh}`;
                const zhFinal = itemMap.zh;

                console.log(`🔧 Fixing Item: ${itemMap.tr}`);

                await updateItem(targetItem.id, {
                    name: trFinal,
                    translations: {
                        ...(targetItem.translations || {}),
                        tr: { name: trFinal, description: targetItem.translations?.tr?.description || targetItem.description },
                        en: { name: enFinal, description: targetItem.translations?.en?.description || '' },
                        zh: { name: zhFinal, description: targetItem.translations?.zh?.description || '' }
                    }
                });
            } else {
                console.log(`⚠️ Item not found: ${itemMap.tr}`);
            }
        }
    }
    console.log('\n✨ Menu names fixed successfully!');
}

async function updateCategory(id, payload) {
    try {
        const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) console.error(`❌ Failed to update category ${id}`);
    } catch (e) {
        console.error(`❌ Error updating category ${id}:`, e);
    }
    await sleep(100);
}

async function updateItem(id, payload) {
    try {
        const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) console.error(`❌ Failed to update item ${id}`);
    } catch (e) {
        console.error(`❌ Error updating item ${id}:`, e);
    }
    await sleep(100);
}

fixMenu();
