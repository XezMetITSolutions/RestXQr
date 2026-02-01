const express = require('express');
const router = express.Router();
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');

/**
 * @route   POST /api/debug/print-font-test
 * @desc    Font boyutu test yazdırma (Farklı boyutları denemek için)
 */
router.post('/print-font-test', async (req, res) => {
    try {
        const { printerIP, printerPort, fontConfig, sizeName, sizeDescription } = req.body;

        if (!printerIP) {
            return res.status(400).json({ success: false, error: 'Yazıcı IP adresi gerekli' });
        }

        console.log(`🖨️ Font Test: ${sizeName} - IP: ${printerIP}:${printerPort}`);

        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: `tcp://${printerIP}:${printerPort || 9100}`,
            characterSet: CharacterSet.PC857_TURKISH,
            removeSpecialCharacters: false,
            lineCharacter: '-',
            options: { timeout: 5000 }
        });

        const isConnected = await printer.isPrinterConnected();
        if (!isConnected) {
            return res.status(400).json({ success: false, error: 'Yazıcıya bağlanılamadı' });
        }

        // Başlık
        printer.alignCenter();
        printer.bold(true);
        printer.println('=== FONT BOYUTU TEST ===');
        printer.bold(false);
        printer.println(`Boyut: ${sizeName}`);
        printer.println(`Ayar: ${sizeDescription}`);
        printer.drawLine();
        printer.newLine();

        // Masa numarası (Ana test alanı)
        printer.alignCenter();

        if (fontConfig.bold) printer.bold(true);
        if (fontConfig.doubleHeight) printer.setTextDoubleHeight();
        if (fontConfig.doubleWidth) printer.setTextDoubleWidth();

        printer.println('MASA: 5');

        printer.setTextNormal();
        printer.bold(false);

        // İstasyon adı
        if (fontConfig.bold) printer.bold(true);
        printer.println('[ MUTFAK ]');
        printer.bold(false);
        printer.drawLine();
        printer.newLine();

        // Tarih
        printer.alignLeft();
        printer.println(`Tarih: ${new Date().toLocaleString('tr-TR')}`);
        printer.drawLine();
        printer.newLine();

        // Sipariş detayı başlığı
        printer.bold(true);
        printer.println('SIPARIS DETAYI:');
        printer.bold(false);
        printer.newLine();

        // Ürünler
        const testItems = [
            { quantity: 2, name: 'Adana Kebap', variations: 'Az acili, Buyuk porsiyon', notes: 'Acisiz olsun' },
            { quantity: 1, name: 'Lahmacun', variations: null, notes: null },
            { quantity: 3, name: 'Ayran', variations: null, notes: null }
        ];

        for (const item of testItems) {
            if (fontConfig.bold) printer.bold(true);
            printer.println(`${item.quantity}x ${item.name}`);
            printer.bold(false);

            if (item.variations) {
                printer.println(`   > ${item.variations}`);
            }
            if (item.notes) {
                printer.bold(true);
                printer.println(`   !! NOT: ${item.notes}`);
                printer.bold(false);
            }
            printer.newLine();
        }

        printer.drawLine();
        printer.newLine();
        printer.alignCenter();
        printer.bold(true);
        printer.println('AFIYET OLSUN!');
        printer.bold(false);
        printer.newLine();

        // Font bilgisi
        printer.println('---');
        printer.println(`[${sizeName}]`);
        printer.println(`doubleH: ${fontConfig.doubleHeight ? 'EVET' : 'HAYIR'}`);
        printer.println(`doubleW: ${fontConfig.doubleWidth ? 'EVET' : 'HAYIR'}`);
        printer.println(`bold: ${fontConfig.bold ? 'EVET' : 'HAYIR'}`);

        printer.newLine();
        printer.newLine();
        printer.cut();

        await printer.execute();

        console.log(`✅ Font test yazdırma başarılı: ${sizeName}`);
        res.json({ success: true, message: `${sizeName} yazdırıldı` });

    } catch (error) {
        console.error('❌ Font test yazdırma hatası:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
