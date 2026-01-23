const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { MenuItem } = require('../models');

// GET /api/sync/local-price-list
router.get('/local-price-list', (req, res) => {
    try {
        const possiblePaths = [
            path.join(__dirname, '../../../fiyat_listesi.json'),
            path.join(__dirname, '../../fiyat_listesi.json'),
            path.join(process.cwd(), 'fiyat_listesi.json'),
            path.join(process.cwd(), '../fiyat_listesi.json')
        ];

        let filePath = null;
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                filePath = p;
                break;
            }
        }

        if (!filePath) {
            return res.status(404).json({
                success: false,
                message: 'fiyat_listesi.json bulunamadı'
            });
        }

        const rawData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(rawData);

        res.json({
            success: true,
            data: jsonData
        });

    } catch (error) {
        console.error('❌ Fiyat listesi okuma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Dosya okuma hatası',
            error: error.message
        });
    }
});

// POST /api/sync/batch-update
router.post('/batch-update', async (req, res) => {
    try {
        const updates = req.body;
        console.log(`🔄 Batch updating ${updates.length} items...`);
        const results = [];

        for (const update of updates) {
            const { id, ...fields } = update;
            try {
                const item = await MenuItem.findByPk(id);
                if (item) {
                    await item.update(fields);
                    results.push({ id, status: 'updated' });
                } else {
                    results.push({ id, status: 'not_found' });
                }
            } catch (err) {
                console.error(`❌ Error updating item ${id}:`, err);
                results.push({ id, status: 'error', error: err.message });
            }
        }

        res.json({
            success: true,
            message: `${results.filter(r => r.status === 'updated').length} ürün güncellendi`,
            results
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
});

// POST /api/sync/batch-create
router.post('/batch-create', async (req, res) => {
    try {
        const { items, restaurantId, categoryId } = req.body;

        if (!items || !restaurantId || !categoryId) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        console.log(`➕ Batch creating ${items.length} items for restaurant ${restaurantId} in category ${categoryId}...`);
        const results = [];

        for (const itemData of items) {
            try {
                const newItem = await MenuItem.create({
                    restaurantId,
                    categoryId,
                    name: itemData.name,
                    price: itemData.price,
                    description: itemData.description || '',
                    isAvailable: true
                });
                results.push({ name: itemData.name, status: 'created', id: newItem.id });
            } catch (err) {
                console.error(`❌ Error creating item ${itemData.name}:`, err);
                results.push({ name: itemData.name, status: 'error', error: err.message });
            }
        }

        res.json({
            success: true,
            message: `${results.filter(r => r.status === 'created').length} yeni ürün eklendi`,
            results
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Create failed', error: error.message });
    }
});

module.exports = router;
