
const { sequelize, Restaurant, MenuItem } = require('./src/models');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

async function updateDescriptions() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Find Kroren Restaurant
        const restaurant = await Restaurant.findOne({ where: { username: 'kroren' } });
        if (!restaurant) {
            console.error('Restaurant "kroren" not found.');
            return;
        }
        console.log(`Found restaurant: ${restaurant.name} (${restaurant.id})`);

        // 2. Read and Parse Markdown
        const mdPath = path.join(__dirname, '../kroren_menu.md');
        if (!fs.existsSync(mdPath)) {
            console.error('Markdown files not found at:', mdPath);
            return;
        }
        const mdContent = fs.readFileSync(mdPath, 'utf8');

        // Simple parsing logic
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
                    currentItem.description = line.replace('- **Açıklama:**', '').trim();
                }
            }
        }
        if (currentItem) items.push(currentItem);

        console.log(`Parsed ${items.length} items from markdown.`);

        // 3. Update Database
        let updatedCount = 0;

        for (const item of items) {
            // Find finding item in DB
            // Using ILIKE for Postgres or generally strict match might fail on casing, so explicit lower match is better
            const dbItem = await MenuItem.findOne({
                where: {
                    restaurantId: restaurant.id,
                    name: sequelize.where(
                        sequelize.fn('lower', sequelize.col('name')),
                        sequelize.fn('lower', item.name)
                    )
                }
            });

            if (dbItem) {
                // Logic: "Henüz açıklaması olmayanlara" -> Only update if description is empty or null
                if (!dbItem.description || dbItem.description.trim() === '') {
                    let newDesc = item.description;

                    // User rule: "açıklama yok olanları boş bırakalım"
                    // This implies that if the source description says "Açıklama yok", we should treat it as empty.
                    if (newDesc === 'Açıklama yok' || newDesc === 'Açıklama yok.') {
                        newDesc = '';
                    }

                    if (newDesc !== '') {
                        dbItem.description = newDesc;
                        await dbItem.save();
                        console.log(`Updated: ${item.name} -> ${newDesc.substring(0, 30)}...`);
                        updatedCount++;
                    }
                }
            } else {
                console.log(`Skipped (Not Found): ${item.name}`);
            }
        }

        console.log(`Completed. Updated ${updatedCount} items.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

updateDescriptions();
