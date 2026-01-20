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

        // 1. Add variants column
        try {
            await sequelize.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;`);
            log('✅ Column "variants" added or already exists.');
        } catch (e) {
            log(`❌ Error adding column: ${e.message}`);
        }

        // 2. Process Dana Etli Ramen
        const ramenItems = await MenuItem.findAll({
            where: {
                name: { [Op.iLike]: '%Dana etli ramen%' }
            }
        });

        if (ramenItems.length >= 2) {
            const itemToKeep = ramenItems[0];
            const itemsToDelete = [];
            const variantItems = [];

            ramenItems.forEach(item => {
                let variantName = 'Normal Porsiyon';
                const lowerName = item.name.toLowerCase();
                const price = parseFloat(item.price);

                if (lowerName.includes('küçük')) variantName = 'Küçük Porsiyon';
                else if (lowerName.includes('normal')) variantName = 'Normal Porsiyon';
                else if (price < 240) variantName = 'Küçük Porsiyon';

                variantItems.push({ name: variantName, price: price });

                if (item.id !== itemToKeep.id) itemsToDelete.push(item.id);
            });

            // Update Main Item
            await itemToKeep.update({
                name: 'Dana etli ramen-牛肉拉面',
                price: Math.min(...variantItems.map(v => v.price)),
                variants: variantItems
            });
            log(`✅ Merged "Dana etli ramen" into ID: ${itemToKeep.id}`);

            // Delete duplicates
            if (itemsToDelete.length > 0) {
                await MenuItem.destroy({ where: { id: itemsToDelete } });
                log(`🗑️ Deleted ${itemsToDelete.length} redundant ramen items.`);
            }
        } else {
            log('ℹ️ "Dana etli ramen" merge not needed (less than 2 items found).');
        }

        // 3. Process Hoxan
        const hoxanItems = await MenuItem.findAll({
            where: {
                name: { [Op.iLike]: '%Hoxan%' }
            }
        });

        if (hoxanItems.length >= 2) {
            const itemToKeep = hoxanItems[0];
            const itemsToDelete = [];
            const variantItems = [];

            hoxanItems.forEach(item => {
                let variantName = 'Porsiyon';
                if (item.name.includes('2 Adet')) variantName = '2 Adet';
                else if (item.name.includes('4 Adet')) variantName = '4 Adet';

                variantItems.push({ name: variantName, price: parseFloat(item.price) });
                if (item.id !== itemToKeep.id) itemsToDelete.push(item.id);
            });

            await itemToKeep.update({
                name: 'Hoxan',
                price: Math.min(...variantItems.map(v => v.price)),
                variants: variantItems
            });
            log(`✅ Merged "Hoxan" into ID: ${itemToKeep.id}`);

            if (itemsToDelete.length > 0) {
                await MenuItem.destroy({ where: { id: itemsToDelete } });
                log(`🗑️ Deleted ${itemsToDelete.length} redundant hoxan items.`);
            }
        } else {
            log('ℹ️ "Hoxan" merge not needed.');
        }

        res.send(`
            <div style="font-family: monospace; padding: 20px; background: #222; color: #0f0;">
                <h1>Migration Log</h1>
                <ul>
                    ${logs.map(l => `<li>${l}</li>`).join('')}
                </ul>
                <h2 style="color: white">Migration Completed! 🚀</h2>
                <a href="/" style="color: #3498db">Go Home</a>
            </div>
        `);

    } catch (error) {
        res.status(500).send(`<pre style="color:red">${error.stack}</pre>`);
    }
});

router.post('/fix-db-schema', async (req, res) => {
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

        res.json({ success: true, message: 'Database schema fixed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
