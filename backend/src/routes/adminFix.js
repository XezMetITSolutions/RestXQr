const express = require('express');
const router = express.Router();
const { AdminUser } = require('../models');
const { hashPassword } = require('../lib/adminAuth');

// GET /api/admin-fix - Get info and Reset
router.get('/', async (req, res) => {
    try {
        const admin = await AdminUser.findOne();
        if (!admin) {
            return res.send('<h1>Hiç admin bulunamadı!</h1>');
        }

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Kurtarma</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6; }
                    .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd; }
                    .form-group { margin-bottom: 15px; }
                    input { padding: 10px; width: 100%; box-sizing: border-box; }
                    button { padding: 12px 20px; background: #27ae60; color: white; border: none; cursor: pointer; border-radius: 5px; font-weight: bold; }
                    .warning { color: #d35400; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>🔑 Admin Kurtarma Paneli</h1>
                
                <div class="info">
                    <h3>Mevcut Admin Bilgisi:</h3>
                    <p><strong>Username:</strong> <span style="color: blue; font-size: 1.2em;">${admin.username}</span></p>
                    <p><strong>Email:</strong> ${admin.email}</p>
                    <p><strong>Durum:</strong> ${admin.status} ${admin.isLocked() ? '(Kilitli 🔒)' : '(Açık ✅)'}</p>
                </div>

                <p class="warning">Şifreyi sıfırlamak istiyorsanız aşağıya yeni şifreyi yazın:</p>
                
                <form method="POST" action="/api/admin-fix/reset">
                    <input type="hidden" name="id" value="${admin.id}">
                    <div class="form-group">
                        <label>Yeni Şifre:</label>
                        <input type="text" name="newPassword" required placeholder="Yeni şifreyi buraya yazın">
                    </div>
                    <button type="submit">Şifreyi Güncelle ve Kilidi Aç</button>
                </form>

                <p style="margin-top: 30px; font-size: 0.8em; color: gray;">Önemli: Giriş yaparken yukarıdaki <b>Username</b> kısmını kullandığınızdan emin olun.</p>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST /api/admin-fix/reset
router.post('/reset', async (req, res) => {
    try {
        const { id, newPassword } = req.body;
        const password_hash = await hashPassword(newPassword);

        await AdminUser.update({
            password_hash,
            status: 'active',
            login_attempts: 0,
            locked_until: null
        }, {
            where: { id }
        });

        res.send(`
            <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                <h1 style="color: green;">✅ Şifre Başarıyla Güncellendi!</h1>
                <p>Şimdi giriş yapmayı deneyebilirsiniz.</p>
                <p><a href="/admin/login" style="padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">Giriş Sayfasına Dön</a></p>
            </div>
        `);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// GET /api/admin-fix/apply-variants - Apply Database Migration for Variants
router.get('/apply-variants', async (req, res) => {
    let logs = [];
    const log = (msg) => logs.push(msg);

    try {
        const { sequelize, MenuItem } = require('../models');
        const { Op } = require('sequelize');

        log('🚀 Starting Variants Migration...');

        // 1. Add variations and options columns
        try {
            await sequelize.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]'::jsonb;`);
            log('✅ Column "variations" added or already exists.');

            await sequelize.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;`);
            log('✅ Column "options" added or already exists.');
        } catch (e) {
            log(`❌ Error adding columns: ${e.message}`);
        }

        // 2. Process Dana Etli Ramen
        const ramenItems = await MenuItem.findAll({
            where: {
                name: { [Op.iLike]: '%Dana etli ramen%' }
            }
        });

        if (ramenItems.length >= 1) {
            const itemToKeep = ramenItems[0];
            const itemsToDelete = [];
            const variantItems = [];

            // If it already has variants and we don't want to overwrite, we could check here.
            // But let's assume we want to enforce the structure if it's missing or incomplete.

            // Collect all potential variants from all found items (even if just 1)
            ramenItems.forEach(item => {
                let variantName = 'Normal Porsiyon';
                const lowerName = item.name.toLowerCase();
                const price = parseFloat(item.price);

                if (lowerName.includes('küçük')) variantName = 'Küçük Porsiyon';
                else if (lowerName.includes('normal')) variantName = 'Normal Porsiyon';
                else if (price < 240) variantName = 'Küçük Porsiyon'; // Price heuristic

                variantItems.push({ name: variantName, price: price });

                if (item.id !== itemToKeep.id) itemsToDelete.push(item.id);
            });

            // Ensure we have at least defaults if only one item found and it has no specific name
            if (ramenItems.length === 1 && variantItems.length === 1) {
                // If the single item is just "Dana etli ramen", maybe add a small option too?
                // Or just keep it as is but formatted as variant.
            }

            // Update Main Item
            // Only update if variants are actually creating a change or new structure
            // Update Main Item (Logic for existing ramen migration specific, keeping as is)
            // ...
        }

        res.json({ logs });
    } catch (error) {
        log(`Fatal Error: ${error.message}`);
        res.status(500).json({ logs, error: error.message });
    }
});

// POST /api/admin-fix/debug-create-item - Debug Route to Create Item
router.post('/debug-create-item', async (req, res) => {
    try {
        const { MenuItem } = require('../models');
        console.log('🐞 DEBUG: Received Create Item Request:', JSON.stringify(req.body, null, 2));

        const { restaurantId, categoryId, name, price, variations, options } = req.body;

        const item = await MenuItem.create({
            restaurantId,
            categoryId,
            name,
            price,
            variations: variations || [],
            options: options || []
        });

        console.log('🐞 DEBUG: Item Created:', JSON.stringify(item.toJSON(), null, 2));

        res.json({
            success: true,
            data: item,
            receivedBody: req.body
        });
    } catch (error) {
        console.error('🐞 DEBUG: Create Item Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
});
// GET /api/admin-fix/apply-kroren-demo - Apply Demo Data for Kroren
router.get('/apply-kroren-demo', async (req, res) => {
    let logs = [];
    const log = (msg) => logs.push(msg);

    try {
        const { Restaurant, MenuItem, sequelize } = require('../models');
        const { Op } = require('sequelize');

        log('🚀 Starting Kroren Demo Data...');

        // 1. Find Kroren Restaurant
        const restaurant = await Restaurant.findOne({
            where: {
                name: { [Op.iLike]: '%Kroren%' }
            }
        });

        if (!restaurant) {
            log('❌ Restaurant "Kroren" not found.');
            return res.json({ logs });
        }

        log(`✅ Found Restaurant: ${restaurant.name} (${restaurant.id})`);

        // 2. Find a Product (e.g., Any Product)
        const item = await MenuItem.findOne({
            where: { restaurantId: restaurant.id },
            order: [['created_at', 'DESC']] // Pickup latest
        });

        if (!item) {
            log('❌ No products found for this restaurant.');
            return res.json({ logs });
        }

        log(`✅ Found Item: ${item.name} (${item.id})`);

        // 3. Update with Variations and Options
        const demoVariations = [
            { name: 'Küçük Porsiyon', price: parseFloat(item.price) },
            { name: 'Büyük Porsiyon', price: parseFloat(item.price) * 1.5 }
        ];

        const demoOptions = [
            { name: 'Acı Tercihi', values: ['Az Acılı', 'Orta Acılı', 'Çok Acılı'] },
            { name: 'Ekstralar', values: ['Susam', 'Yeşil Soğan', 'Yumurta'] }
        ];

        await item.update({
            variations: demoVariations,
            options: demoOptions
        });

        log(`🎉 Updated item "${item.name}" with demo variations and options.`);

        res.send(`
            <div style="font-family: monospace; padding: 20px; background: #222; color: #0f0;">
                <h1>Kroren Demo Setup</h1>
                <ul>
                    ${logs.map(l => `<li>${l}</li>`).join('')}
                </ul>
                <h2 style="color: white">Done! 🚀</h2>
            </div>
        `);

    } catch (error) {
        log(`Fatal Error: ${error.message}`);
        res.status(500).json({ logs, error: error.message });
    }
});



// GET /api/admin-fix/debug-items - List latest items for debug dashboard
router.get('/debug-items', async (req, res) => {
    try {
        const { MenuItem, Restaurant } = require('../models');
        const items = await MenuItem.findAll({
            limit: 20,
            order: [['created_at', 'DESC']],
            include: [{
                model: Restaurant,
                as: 'restaurant',
                attributes: ['name']
            }]
        });
        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/admin-fix/debug-add-variations/:itemId - Add demo variations to specific item
router.post('/debug-add-variations/:itemId', async (req, res) => {
    try {
        const { MenuItem } = require('../models');
        const { itemId } = req.params;
        const item = await MenuItem.findByPk(itemId);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const demoVariations = [
            { name: 'Small', price: parseFloat(item.price) },
            { name: 'Medium', price: parseFloat(item.price) * 1.25 },
            { name: 'Large', price: parseFloat(item.price) * 1.5 }
        ];

        const demoOptions = [
            { name: 'Spiciness', values: ['Mild', 'Hot', 'Extra Hot'] },
            { name: 'Toppings', values: ['Cheese', 'Mushroom', 'Extra Sauce'] }
        ];

        await item.update({
            variations: demoVariations,
            options: demoOptions
        });

        res.json({ success: true, message: 'Updated item with demo variations', item });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/fix-db-schema', async (req, res) => {
    try {
        const { sequelize } = require('../models');

        // Check and add kitchen_station to menu_categories
        try {
            await sequelize.query(`
        DO $$
BEGIN
BEGIN
            ALTER TABLE menu_categories ADD COLUMN kitchen_station VARCHAR(50);
EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column kitchen_station already exists in menu_categories.';
END;
        END $$;
`);
            console.log('✅ Added kitchen_station to menu_categories');
        } catch (e) {
            console.error('Error adding kitchen_station:', e.message);
        }

        // Check and add variations to menu_items
        try {
            await sequelize.query(`
        DO $$
BEGIN
BEGIN
            ALTER TABLE menu_items ADD COLUMN variations JSONB DEFAULT '[]':: jsonb;
EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column variations already exists in menu_items.';
END;
        END $$;
`);
            console.log('✅ Added variations to menu_items');
        } catch (e) {
            console.error('Error adding variations:', e.message);
        }

        // Check and add options to menu_items
        try {
            await sequelize.query(`
        DO $$
BEGIN
BEGIN
            ALTER TABLE menu_items ADD COLUMN options JSONB DEFAULT '[]':: jsonb;
EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column options already exists in menu_items.';
END;
        END $$;
`);
            console.log('✅ Added options to menu_items');
        } catch (e) {
            console.error('Error adding options:', e.message);
        }

        // Check and add type to menu_items
        try {
            await sequelize.query(`
        DO $$
BEGIN
BEGIN
            ALTER TABLE menu_items ADD COLUMN type VARCHAR(20) DEFAULT 'single';
EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column type already exists in menu_items.';
END;
        END $$;
`);
            console.log('✅ Added type to menu_items');
        } catch (e) {
            console.error('Error adding type:', e.message);
        }

        // Check and add bundle_items to menu_items
        try {
            await sequelize.query(`
        DO $$
BEGIN
BEGIN
            ALTER TABLE menu_items ADD COLUMN bundle_items JSONB DEFAULT '[]'::jsonb;
EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column bundle_items already exists in menu_items.';
END;
        END $$;
`);
            console.log('✅ Added bundle_items to menu_items');
        } catch (e) {
            console.error('Error adding bundle_items:', e.message);
        }

        res.json({ success: true, message: 'Database schema fixed (kitchen_station, variations, options, type, bundle_items)' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
