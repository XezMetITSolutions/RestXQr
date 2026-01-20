const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/masapp', {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

// Define MenuItem model briefly for querying
const MenuItem = sequelize.define('MenuItem', {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL },
    variants: { type: DataTypes.JSONB }
}, {
    tableName: 'menu_items',
    timestamps: false
});

async function migrateKrorenProducts() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // 1. Dana etli ramen merging
        console.log('\n🍜 Processing "Dana etli ramen"...');
        const ramenItems = await sequelize.query(
            `SELECT * FROM menu_items WHERE name LIKE '%Dana etli ramen%' OR name LIKE '%Dana Etli Ramen%'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (ramenItems.length >= 2) {
            // Assuming sorting by price might allow distinguishing, but user gave names:
            // "Dana etli ramen... Küçük Porsiyon"
            // "Dana etli ramen... Normal Porsiyon"

            // Let's identify the main item (e.g., Smaller price or just pick the first one and update it)
            // User said: arrange "upper two products".
            // Let's construct a variants array.

            const variantItems = [];
            const itemToKeep = ramenItems[0]; // We'll keep the first one found
            const itemsToDelete = [];

            for (const item of ramenItems) {
                let variantName = 'Normal Porsiyon';
                if (item.name.toLowerCase().includes('küçük')) variantName = 'Küçük Porsiyon';
                else if (item.name.toLowerCase().includes('normal')) variantName = 'Normal Porsiyon';
                else {
                    // Try to guess from user description or prices
                    // 228 -> Kucuk, 248 -> Normal
                    const price = parseFloat(item.price);
                    if (price < 240) variantName = 'Küçük Porsiyon';
                }

                variantItems.push({
                    name: variantName,
                    price: parseFloat(item.price)
                });

                if (item.id !== itemToKeep.id) {
                    itemsToDelete.push(item.id);
                }
            }

            // Update the kept item
            // Clean up the name? "Dana etli ramen-牛肉拉面" seems to be the base name.
            const baseName = "Dana etli ramen-牛肉拉面";

            await MenuItem.update(
                {
                    name: baseName,
                    // Set base price to the lowest variant or specific logic? 
                    // Usually base price is visible, variants override. 
                    // Let's set price to the cheaper one (228) and variants has both.
                    price: Math.min(...variantItems.map(v => v.price)),
                    variants: variantItems
                },
                { where: { id: itemToKeep.id } }
            );
            console.log(`✅ Updated Ramen ID ${itemToKeep.id} with variants:`, variantItems);

            // Delete the others
            if (itemsToDelete.length > 0) {
                await MenuItem.destroy({ where: { id: itemsToDelete } });
                console.log(`🗑️ Deleted redundant Ramen items: ${itemsToDelete.join(', ')}`);
            }

        } else {
            console.log('⚠️ Could not find multiple Ramen items to merge, or already merged.');
        }


        // 2. Hoxan merging
        console.log('\n🥟 Processing "Hoxan"...');
        // "Hoxan 2 Adet", "Hoxan 4 Adet"
        const hoxanItems = await sequelize.query(
            `SELECT * FROM menu_items WHERE name LIKE '%Hoxan%'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (hoxanItems.length >= 2) {
            const itemToKeep = hoxanItems[0];
            const itemsToDelete = [];
            const variantItems = [];

            for (const item of hoxanItems) {
                let variantName = 'Porsiyon';
                if (item.name.includes('2 Adet')) variantName = '2 Adet';
                else if (item.name.includes('4 Adet')) variantName = '4 Adet';

                variantItems.push({
                    name: variantName,
                    price: parseFloat(item.price)
                });

                if (item.id !== itemToKeep.id) itemsToDelete.push(item.id);
            }

            // Clean name
            const baseName = "Hoxan";

            await MenuItem.update(
                {
                    name: baseName,
                    price: Math.min(...variantItems.map(v => v.price)),
                    variants: variantItems
                },
                { where: { id: itemToKeep.id } }
            );
            console.log(`✅ Updated Hoxan ID ${itemToKeep.id} with variants:`, variantItems);

            if (itemsToDelete.length > 0) {
                await MenuItem.destroy({ where: { id: itemsToDelete } });
                console.log(`🗑️ Deleted redundant Hoxan items: ${itemsToDelete.join(', ')}`);
            }

        } else {
            console.log('⚠️ Could not find multiple Hoxan items to merge, or already merged.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrateKrorenProducts();
