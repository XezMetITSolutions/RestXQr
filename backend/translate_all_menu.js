const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';
const DEEPL_API_KEY = process.env.DEEPL_API_KEY || process.env.NEXT_PUBLIC_DEEPL_API_KEY;

if (!DEEPL_API_KEY) {
    console.error('❌ DEEPL_API_KEY environment variable is required.');
    process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text, targetLang) {
    if (!text || text === 'Açıklama yok') return '';
    try {
        const params = new URLSearchParams();
        params.append('text', text);
        params.append('target_lang', targetLang.toUpperCase());

        const isFree = DEEPL_API_KEY.trim().endsWith(':fx');
        const apiUrl = isFree ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`DeepL API Error: ${response.status} ${error}`);
        }

        const data = await response.json();
        return data.translations[0].text;
    } catch (error) {
        console.error(`Translation error for "${text}" to ${targetLang}:`, error.message);
        return text;
    }
}

async function processMenu() {
    console.log('🔄 Fetching menu data...');

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
        if (baseName.includes(' - ')) baseName = baseName.split(' - ')[0];

        console.log(`\nProcessing Category: ${baseName}`);

        const zhName = await translateText(baseName, 'zh');
        const enName = await translateText(baseName, 'en');

        const baseDesc = cat.description && cat.description !== 'Açıklama yok' ? cat.description : '';
        const zhDesc = baseDesc ? await translateText(baseDesc, 'zh') : '';
        const enDesc = baseDesc ? await translateText(baseDesc, 'en') : '';

        // Formats requested:
        // TR: Türkce - Çinçe
        // EN: İngilizce - Çinçe
        // ZH: Çinçe
        const trName = `${baseName} - ${zhName}`;
        const enNameFinal = `${enName} - ${zhName}`;
        const zhNameFinal = zhName;

        const payload = {
            ...cat,
            name: trName,
            translations: {
                ...(cat.translations || {}),
                tr: { name: trName, description: baseDesc },
                en: { name: enNameFinal, description: enDesc },
                zh: { name: zhNameFinal, description: zhDesc }
            }
        };

        await updateCategory(cat.id, payload);
        await sleep(200);
    }

    // --- Process Items ---
    for (const item of items) {
        let baseName = item.name;
        if (baseName.includes(' - ')) baseName = baseName.split(' - ')[0];

        console.log(`\nProcessing Item: ${baseName}`);

        const zhName = await translateText(baseName, 'zh');
        const enName = await translateText(baseName, 'en');

        const baseDesc = item.description && item.description !== 'Açıklama yok' ? item.description : '';
        const zhDesc = baseDesc ? await translateText(baseDesc, 'zh') : '';
        const enDesc = baseDesc ? await translateText(baseDesc, 'en') : '';

        const trName = `${baseName} - ${zhName}`;
        const enNameFinal = `${enName} - ${zhName}`;
        const zhNameFinal = zhName;

        const payload = {
            ...item,
            name: trName,
            translations: {
                ...(item.translations || {}),
                tr: { name: trName, description: baseDesc },
                en: { name: enNameFinal, description: enDesc },
                zh: { name: zhNameFinal, description: zhDesc }
            }
        };

        await updateItem(item.id, payload);
        await sleep(200);
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
        else console.error(`❌ Failed update cat ${id}: ${res.status}`);
    } catch (e) {
        console.error(`❌ Error cat ${id}:`, e);
    }
}

async function updateItem(id, payload) {
    try {
        const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) console.log(`✅ Item updated: ${payload.name}`);
        else console.error(`❌ Failed update item ${id}: ${res.status}`);
    } catch (e) {
        console.error(`❌ Error item ${id}:`, e);
    }
}

processMenu();
