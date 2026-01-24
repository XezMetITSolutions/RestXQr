
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://masapp-backend.onrender.com/api';
// Using the ID found in update_kroren_menu.js
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

async function updateDescriptions() {
    console.log('Fetching existing menu items...');
    let existingItems = [];
    try {
        const res = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        existingItems = data.data || [];
        console.log(`Fetched ${existingItems.length} items from API.`);
    } catch (e) {
        console.error('Failed to fetch items:', e);
        return;
    }

    // Read Markdown
    const mdPath = path.join(__dirname, '../kroren_menu.md');
    if (!fs.existsSync(mdPath)) {
        console.error('Markdown file not found:', mdPath);
        return;
    }
    const mdContent = fs.readFileSync(mdPath, 'utf8');

    // Parse Markdown
    const items = [];
    const lines = mdContent.split('\n');
    let currentItem = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('### ')) {
            if (currentItem) items.push(currentItem);
            currentItem = { name: line.replace('### ', '').trim() };
        } else if (line.startsWith('- **Açıklama:**')) {
            if (currentItem) {
                let desc = line.replace('- **Açıklama:**', '').trim();
                // User condition: "açıklama yok olanları boş bırakalım"
                // Meaning if the SOURCE says "Açıklama yok", we treat it as empty.
                if (desc.toLowerCase().includes('açıklama yok')) {
                    desc = '';
                }
                currentItem.description = desc;
            }
        }
    }
    if (currentItem) items.push(currentItem);
    console.log(`Parsed ${items.length} items from markdown.`);

    // Update
    let updatedCount = 0;

    for (const item of items) {
        // Find in existing
        // Try exact match first (case-insensitive)
        let dbItem = existingItems.find(ep =>
            ep.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );

        // Fallback: Check if names are very similar (e.g. one contains the other) if exact fail?
        // Risky. Let's stick to exact match for now as names seem consistent.

        if (dbItem) {
            // Check if DB item needs description update
            // Condition: "Henüz açıklaması olmayanlara" -> If DB description is empty
            const currentDesc = dbItem.description ? dbItem.description.trim() : '';

            // If current description is empty, or explicitly "Açıklama yok" (which we might want to clear)
            const isDbDescEmpty = !currentDesc || currentDesc.toLowerCase() === 'açıklama yok';

            if (isDbDescEmpty) {
                const newDesc = item.description || '';

                // Avoid updating if both are empty
                if (newDesc !== currentDesc) {
                    // Prepare payload preserving existing data
                    // Note: The API likely expects fields to match the schema.
                    const payload = {
                        categoryId: dbItem.categoryId,
                        name: dbItem.name,
                        description: newDesc,
                        price: dbItem.price,
                        imageUrl: dbItem.imageUrl,
                        isAvailable: dbItem.isAvailable,
                        kitchenStation: dbItem.kitchenStation,
                        type: dbItem.type,
                        displayOrder: dbItem.displayOrder,
                        // Add other potentially required fields or rely on backend to handle partial/missing
                        isPopular: dbItem.isPopular,
                        calories: dbItem.calories,
                        preparationTime: dbItem.preparationTime,
                        allergens: dbItem.allergens,
                        ingredients: dbItem.ingredients
                    };

                    process.stdout.write(`Updating ${item.name}... `);
                    try {
                        const updateRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items/${dbItem.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (updateRes.ok) {
                            console.log(`✅ OK`);
                            updatedCount++;
                        } else {
                            console.log(`❌ Failed (${updateRes.status})`);
                        }
                    } catch (err) {
                        console.log(`❌ Error: ${err.message}`);
                    }

                    // Helper delay to avoid rate limiting
                    await new Promise(r => setTimeout(r, 100));
                }
            } else {
                // DB has a description. User said "Henüz açıklaması olmayanlara" (To those who don't have a description yet).
                // So we skip this.
                // console.log(`Skipped: ${item.name} (Already has description)`);
            }
        } else {
            console.log(`⚠️ Not found in DB: ${item.name}`);
        }
    }
    console.log(`\nDone. Updated ${updatedCount} items.`);
}

updateDescriptions();
