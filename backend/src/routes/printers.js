const express = require('express');
const router = express.Router();
const printerService = require('../services/printerService');

/**
 * @route   GET /api/printers
 * @desc    Tüm yazıcı istasyonlarını listele
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const stations = printerService.getStations();
        res.json({ success: true, data: stations });
    } catch (error) {
        console.error('Printer stations list error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   PUT /api/printers/:station
 * @desc    İstasyon yazıcı ayarlarını güncelle
 * @access  Private
 */
router.put('/:station', async (req, res) => {
    try {
        const { station } = req.params;
        const { name, ip, port, enabled, type, language } = req.body;

        printerService.updateStationPrinter(station, {
            name,
            ip,
            port: port || 9100,
            enabled: enabled !== undefined ? enabled : true,
            type: type || 'epson',
            language: language || 'tr' // Varsayılan Türkçe
        });

        res.json({
            success: true,
            message: `${station} yazıcısı güncellendi`,
            data: printerService.stations[station]
        });
    } catch (error) {
        console.error('Printer update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/printers/:station/print
 * @desc    Belirli bir istasyona sipariş yazdır
 * @access  Private
 */
router.post('/:station/print', async (req, res) => {
    try {
        const { station } = req.params;
        const orderData = req.body;

        const result = await printerService.printOrderAdvanced(station, orderData);

        if (result.success) {
            res.json({ success: true, message: 'Yazdırma başarılı' });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Print error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/printers/:station/test
 * @desc    Test yazdırma
 * @access  Private
 */
router.post('/:station/test', async (req, res) => {
    try {
        const { station } = req.params;
        const result = await printerService.printTest(station);

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
 * @access  Private
 */
router.get('/:station/status', async (req, res) => {
    try {
        const { station } = req.params;
        const status = await printerService.checkPrinterStatus(station);

        res.json({ success: true, data: status });
    } catch (error) {
        console.error('Printer status error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/printers/print-order
 * @desc    Siparişi ilgili istasyonlara yazdır
 * @access  Private
 */
router.post('/print-order', async (req, res) => {
    try {
        const { orderData, stations } = req.body;

        // Birden fazla istasyona yazdır
        const results = await Promise.all(
            stations.map(station =>
                printerService.printOrderAdvanced(station, orderData)
            )
        );

        const allSuccess = results.every(r => r.success);

        if (allSuccess) {
            res.json({
                success: true,
                message: 'Tüm istasyonlara yazdırıldı',
                results
            });
        } else {
            res.status(207).json({
                success: false,
                message: 'Bazı yazıcılarda hata',
                results
            });
        }
    } catch (error) {
        console.error('Multi-station print error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
