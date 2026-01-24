
const fs = require('fs');

const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

if (!DEEPL_API_KEY) {
    console.error('❌ DEEPL_API_KEY environment variable is required.');
    process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text, targetLang) {
    if (!text) return '';
    try {
        const params = new URLSearchParams();
        params.append('text', text);
        params.append('target_lang', targetLang.toUpperCase());

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            // Try Pro API if Free fails (or vice versa logic if needed, but usually domain differs)
            const responsePro = await fetch('https://api.deepl.com/v2/translate', {
                method: 'POST',
                headers: {
                    'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
            if (!responsePro.ok) throw new Error(`DeepL API Error: ${responsePro.statusText}`);
            const data = await responsePro.json();
            return data.translations[0].text;
        }

        const data = await response.json();
        return data.translations[0].text;
    } catch (error) {
        console.error(`Translation error for "${text}" to ${targetLang}:`, error.message);
        return text; // Fallback to original
    }
}

async function processMenu() {
    console.log('🔄 Fetching menu data...');

    // Fetch Categories and Items
    const [catRes, itemRes] = await Promise.all([
        fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`),
        fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`)
    ]);

    const categories = (await catRes.json()).data || [];
    const items = (await itemRes.json()).data || [];

    console.log(`✅ Found ${categories.length} categories and ${items.length} items.`);

    // --- Process Categories ---
    for (const cat of categories) {
        let baseName = cat.name;
        // Clean existing suffixes if present (assuming " - " separator)
        if (baseName.includes(' - ')) {
            baseName = baseName.split(' - ')[0];
        }

        console.log(`\nProcessing Category: ${baseName}`);

        const zhName = await translateText(baseName, 'zh');
        const enName = await translateText(baseName, 'en');

        // Translate Description
        const baseDesc = cat.description || '';
        const zhDesc = baseDesc ? await translateText(baseDesc, 'zh') : '';
        const enDesc = baseDesc ? await translateText(baseDesc, 'en') : '';

        // Formats
        const trFinal = `${baseName} - ${zhName}`;
        const enFinal = `${enName} - ${zhName}`;
        const zhFinal = zhName;

        const payload = {
            ...cat,
            name: trFinal,
            translations: {
                ...(cat.translations || {}),
                en: { name: enFinal, description: enDesc },
                zh: { name: zhFinal, description: zhDesc },
                tr: { name: trFinal, description: baseDesc } // Ensure TR is consistent
            }
        };

        await updateCategory(cat.id, payload);
    }

    // --- Process Items ---
    for (const item of items) {
        let baseName = item.name;
        if (baseName.includes(' - ')) {
            baseName = baseName.split(' - ')[0];
        }

        console.log(`\nProcessing Item: ${baseName}`);

        const zhName = await translateText(baseName, 'zh');
        const enName = await translateText(baseName, 'en');

        // Description
        const baseDesc = item.description || '';
        const zhDesc = baseDesc ? await translateText(baseDesc, 'zh') : '';
        const enDesc = baseDesc ? await translateText(baseDesc, 'en') : '';

        const trFinal = `${baseName} - ${zhName}`;
        const enFinal = `${enName} - ${zhName}`;
        const zhFinal = zhName;

        const payload = {
            ...item,
            name: trFinal,
            translations: {
                ...(item.translations || {}),
                en: { name: enFinal, description: enDesc },
                zh: { name: zhFinal, description: zhDesc },
                tr: { name: trFinal, description: baseDesc }
            }
        };

        await updateItem(item.id, payload);
    }

    console.log('\n🎉 All done! Menu translated and updated.');
}

async function updateCategory(id, payload) {
    try {
        const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) console.log(`✅ Category updated: ${payload.name}`);
        else console.error(`❌ Failed to update category ${id}: ${res.status}`);
    } catch (e) {
        console.error(`❌ Error updating category ${id}:`, e);
    }
    await sleep(200); // Rate limit protection
}

async function updateItem(id, payload) {
    try {
        const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) console.log(`✅ Item updated: ${payload.name}`);
        else console.error(`❌ Failed to update item ${id}: ${res.status}`);
    } catch (e) {
        console.error(`❌ Error updating item ${id}:`, e);
    }
    await sleep(200);
}

processMenu();
