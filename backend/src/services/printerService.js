const escpos = require('escpos');
const Network = require('escpos-network');
const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');

/**
 * Thermal Printer Service
 * Her istasyon için farklı yazıcı desteği
 */

class PrinterService {
    constructor() {
        // İstasyon yazıcı konfigürasyonları
        this.stations = {
            kitchen: {
                name: 'Mutfak',
                ip: null, // Ayarlardan gelecek
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON // EPSON, STAR, etc.
            },
            bar: {
                name: 'Bar',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON
            },
            cashier: {
                name: 'Kasa',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON
            },
            grill: {
                name: 'Izgara',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON
            },
            dessert: {
                name: 'Tatlı',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON
            }
        };
    }

    /**
     * İstasyon yazıcı ayarlarını güncelle
     */
    updateStationPrinter(station, config) {
        if (this.stations[station]) {
            this.stations[station] = { ...this.stations[station], ...config };
        }
    }

    /**
     * Sipariş fişi yazdır (ESC/POS)
     */
    async printOrder(station, orderData) {
        const stationConfig = this.stations[station];

        if (!stationConfig || !stationConfig.enabled || !stationConfig.ip) {
            console.log(`⚠️ ${station} yazıcısı devre dışı veya IP tanımlı değil`);
            return { success: false, error: 'Printer not configured' };
        }

        try {
            const device = new Network(stationConfig.ip, stationConfig.port);
            const printer = new escpos.Printer(device);

            await device.open(async () => {
                printer
                    .font('a')
                    .align('ct')
                    .style('bu')
                    .size(1, 1)
                    .text(stationConfig.name.toUpperCase())
                    .text('------------------------')
                    .style('normal')
                    .size(0, 0)
                    .text('')

                    // Sipariş bilgileri
                    .align('lt')
                    .text(`Sipariş No: ${orderData.orderNumber}`)
                    .text(`Masa: ${orderData.tableNumber}`)
                    .text(`Tarih: ${new Date().toLocaleString('tr-TR')}`)
                    .text('------------------------')
                    .text('')

                    // Ürünler
                    .style('b');

                // Her ürün için
                orderData.items.forEach(item => {
                    printer
                        .text(`${item.quantity}x ${item.name}`)
                        .style('normal');

                    if (item.notes) {
                        printer.text(`   NOT: ${item.notes}`);
                    }

                    printer.text('');
                });

                printer
                    .text('------------------------')
                    .text('')
                    .align('ct')
                    .text('!!! AFİYET OLSUN !!!')
                    .text('')
                    .cut()
                    .close();
            });

            console.log(`✅ ${station} yazıcısına yazdırıldı`);
            return { success: true };

        } catch (error) {
            console.error(`❌ ${station} yazıcı hatası:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Gelişmiş termal yazıcı ile yazdır (node-thermal-printer)
     */
    async printOrderAdvanced(station, orderData) {
        const stationConfig = this.stations[station];

        if (!stationConfig || !stationConfig.enabled || !stationConfig.ip) {
            console.log(`⚠️ ${station} yazıcısı devre dışı veya IP tanımlı değil`);
            return { success: false, error: 'Printer not configured' };
        }

        try {
            const printer = new ThermalPrinter({
                type: stationConfig.type,
                interface: `tcp://${stationConfig.ip}:${stationConfig.port}`,
                characterSet: 'TURKEY',
                removeSpecialCharacters: false,
                lineCharacter: '-',
                options: {
                    timeout: 5000
                }
            });

            const isConnected = await printer.isPrinterConnected();

            if (!isConnected) {
                throw new Error('Printer not connected');
            }

            printer.alignCenter();
            printer.bold(true);
            printer.setTextDoubleHeight();
            printer.println(stationConfig.name.toUpperCase());
            printer.setTextNormal();
            printer.bold(false);
            printer.drawLine();
            printer.newLine();

            // Sipariş bilgileri
            printer.alignLeft();
            printer.println(`Sipariş No: ${orderData.orderNumber}`);
            printer.println(`Masa: ${orderData.tableNumber}`);
            printer.println(`Tarih: ${new Date().toLocaleString('tr-TR')}`);
            printer.drawLine();
            printer.newLine();

            // Ürünler
            printer.bold(true);
            printer.println('ÜRÜNLER:');
            printer.bold(false);
            printer.newLine();

            orderData.items.forEach(item => {
                printer.bold(true);
                printer.println(`${item.quantity}x ${item.name}`);
                printer.bold(false);

                if (item.notes) {
                    printer.println(`   NOT: ${item.notes}`);
                }

                printer.newLine();
            });

            printer.drawLine();
            printer.newLine();
            printer.alignCenter();
            printer.bold(true);
            printer.println('AFİYET OLSUN!');
            printer.bold(false);
            printer.newLine();
            printer.newLine();
            printer.cut();

            await printer.execute();
            console.log(`✅ ${station} yazıcısına yazdırıldı (Advanced)`);

            return { success: true };

        } catch (error) {
            console.error(`❌ ${station} yazıcı hatası:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test yazdırma
     */
    async printTest(station) {
        const testOrder = {
            orderNumber: 'TEST-' + Date.now(),
            tableNumber: 'TEST',
            items: [
                { quantity: 1, name: 'Test Ürün', notes: 'Test notu' }
            ]
        };

        return await this.printOrderAdvanced(station, testOrder);
    }

    /**
     * Yazıcı durumunu kontrol et
     */
    async checkPrinterStatus(station) {
        const stationConfig = this.stations[station];

        if (!stationConfig || !stationConfig.ip) {
            return {
                connected: false,
                error: 'Printer not configured'
            };
        }

        try {
            const printer = new ThermalPrinter({
                type: stationConfig.type,
                interface: `tcp://${stationConfig.ip}:${stationConfig.port}`,
                options: { timeout: 3000 }
            });

            const isConnected = await printer.isPrinterConnected();

            return {
                connected: isConnected,
                station: stationConfig.name,
                ip: stationConfig.ip,
                port: stationConfig.port
            };

        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    /**
     * Tüm istasyonları listele
     */
    getStations() {
        return Object.entries(this.stations).map(([key, value]) => ({
            id: key,
            ...value
        }));
    }
}

// Singleton instance
const printerService = new PrinterService();

module.exports = printerService;
