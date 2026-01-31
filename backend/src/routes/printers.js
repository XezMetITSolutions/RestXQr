
const express = require('express');
const router = express.Router();
const printerService = require('../services/printerService');
const { Restaurant } = require('../models');

/**
 * Get restaurant from request (either query param or header)
 */
async function getTargetRestaurant(req) {
    const restaurantId = req.query.restaurantId || req.headers['x-restaurant-id'];
    if (!restaurantId) return null;
    return await Restaurant.findByPk(restaurantId);
}

/**
 * @route   GET /api/printers
 * @desc    Tüm yazıcı istasyonlarını listele (Restoran bazlı)
 */
router.get('/', async (req, res) => {
    try {
        const restaurant = await getTargetRestaurant(req);
        if (!restaurant) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required as query param ?restaurantId=...' });
        }

        const printerConfig = restaurant.printerConfig || {};
        const stations = Object.entries(printerConfig).map(([id, config]) => ({
            id,
            ...config
        }));

        res.json({ success: true, data: stations });
    } catch (error) {
        console.error('Printer stations list error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/printers
 * @desc    Yeni yazıcı istasyonu ekle
 */
router.post('/', async (req, res) => {
    try {
        const restaurant = await getTargetRestaurant(req);
        if (!restaurant) {
            return res.status(400).json({ success: false, error: 'Restaurant ID is required' });
        }

        const { id, ...config } = req.body;
        const stationId = id || config.newStationKey;

        if (!stationId) {
            return res.status(400).json({ success: false, error: 'Station ID is required' });
        }

        const currentConfig = { ...(restaurant.printerConfig || {}) };
        currentConfig[stationId] = {
            name: config.name || stationId,
            ip: config.ip || '',
            port: config.port || 9100,
            enabled: config.enabled !== undefined ? config.enabled : true,
            type: config.type || 'epson',
            language: config.language || 'tr'
        };

        await Restaurant.update(
            { printerConfig: currentConfig },
            { where: { id: restaurant.id } }
        );

        res.json({
            success: true,
            message: 'Yazıcı eklendi',
            data: { id: stationId, ...currentConfig[stationId] }
        });
    } catch (error) {
        console.error('Printer create error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   DELETE /api/printers/:station
 * @desc    Yazıcı istasyonunu sil
 */
router.delete('/:station', async (req, res) => {
    try {
        const restaurant = await getTargetRestaurant(req);
        if (!restaurant) return res.status(400).json({ success: false, error: 'Restaurant ID required' });

        const { station } = req.params;
        const currentConfig = restaurant.printerConfig || {};

        if (currentConfig[station]) {
            delete currentConfig[station];
            // Sequelize JSONB update workaround
            await Restaurant.update(
                { printerConfig: currentConfig },
                { where: { id: restaurant.id } }
            );
            res.json({ success: true, message: 'Yazıcı silindi' });
        } else {
            res.status(404).json({ success: false, error: 'Printer not found' });
        }
    } catch (error) {
        console.error('Printer delete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   PUT /api/printers/:station
 * @desc    İstasyon yazıcı ayarlarını güncelle
 */
router.put('/:station', async (req, res) => {
    try {
        const restaurant = await getTargetRestaurant(req);
        if (!restaurant) return res.status(400).json({ success: false, error: 'Restaurant ID required' });

        const { station } = req.params;
        const { name, ip, port, enabled, type, language, newStationKey } = req.body;

        const currentConfig = { ...(restaurant.printerConfig || {}) };

        const updatedData = {
            name: name || currentConfig[station]?.name || station,
            ip: ip !== undefined ? ip : currentConfig[station]?.ip,
            port: port || currentConfig[station]?.port || 9100,
            enabled: enabled !== undefined ? enabled : (currentConfig[station]?.enabled !== undefined ? currentConfig[station].enabled : true),
            type: type || currentConfig[station]?.type || 'epson',
            language: language || currentConfig[station]?.language || 'tr'
        };

        if (newStationKey && newStationKey !== station) {
            delete currentConfig[station];
            currentConfig[newStationKey] = updatedData;
        } else {
            currentConfig[station] = updatedData;
        }

        await Restaurant.update(
            { printerConfig: currentConfig },
            { where: { id: restaurant.id } }
        );

        res.json({
            success: true,
            message: 'Yazıcı güncellendi',
            data: { id: newStationKey || station, ...updatedData }
        });
    } catch (error) {
        console.error('Printer update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/printers/:station/test
 * @desc    Test yazdırma (DB'deki ayarlar ile)
 */
router.post('/:station/test', async (req, res) => {
    try {
        const restaurant = await getTargetRestaurant(req);
        if (!restaurant) return res.status(400).json({ success: false, error: 'Restaurant ID required' });

        const { station } = req.params;
        const config = restaurant.printerConfig?.[station];

        if (!config) {
            return res.status(404).json({ success: false, error: 'Yazıcı konfigürasyonu bulunamadı' });
        }

        const result = await printerService.printTest(config);

        if (result.success) {
            res.json({ success: true, message: 'Test yazdırma başarılı' });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Test print error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/printers/:station/status
 * @desc    Yazıcı bağlantı durumunu kontrol et
 */
router.get('/:station/status', async (req, res) => {
    try {
        const restaurant = await getTargetRestaurant(req);
        if (!restaurant) return res.status(400).json({ success: false, error: 'Restaurant ID required' });

        const { station } = req.params;
        const config = restaurant.printerConfig?.[station];

        if (!config) return res.status(404).json({ success: false, error: 'Printer not found' });

        const status = await printerService.checkPrinterStatusDirect(config);
        res.json({ success: true, data: status });
    } catch (error) {
        console.error('Printer status error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/printers/kitchen-stations
 * @desc    Veritabanındaki mutfak istasyonu isimlerini getir
 */
router.get('/kitchen-stations', async (req, res) => {
    try {
        const { MenuItem, MenuCategory, sequelize } = require('../models');
        const restaurantId = req.query.restaurantId;

        let whereClause = '';
        if (restaurantId) {
            whereClause = `WHERE restaurant_id = '${restaurantId}'`;
        }

        const [itemStations] = await sequelize.query(`
            SELECT DISTINCT kitchen_station 
            FROM menu_items 
            ${whereClause} 
            AND kitchen_station IS NOT NULL AND kitchen_station != ''
        `);

        const [catStations] = await sequelize.query(`
            SELECT DISTINCT kitchen_station 
            FROM menu_categories 
            ${whereClause}
            AND kitchen_station IS NOT NULL AND kitchen_station != ''
        `);

        const allStations = new Set();
        itemStations.forEach(s => allStations.add(s.kitchen_station));
        catStations.forEach(s => allStations.add(s.kitchen_station));

        // Default stations
        ['kavurma', 'ramen', 'kebap', 'manti', 'icecek1', 'icecek2', 'ortakasa', 'bar', 'kasa'].forEach(s => allStations.add(s));

        res.json({
            success: true,
            data: Array.from(allStations).sort()
        });
    } catch (error) {
        console.error('Kitchen stations fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

