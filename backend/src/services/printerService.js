const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
const iconv = require('iconv-lite');

/**
 * Thermal Printer Service
 * Her istasyon için farklı yazıcı desteği
 * Türkçe ve Çince karakter desteği ile
 * Sadece node-thermal-printer kullanılıyor (stable)
 */

class PrinterService {
    constructor() {
        // Türkçe karakter değişim tablosu (CP857 için)
        this.turkishCharMap = {
            'ç': '\x87', 'Ç': '\x80',
            'ğ': '\x98', 'Ğ': '\xA6',
            'ı': '\x8D', 'İ': '\x98',
            'ö': '\x94', 'Ö': '\x99',
            'ş': '\x9E', 'Ş': '\x9D',
            'ü': '\x81', 'Ü': '\x9A'
        };

        // İstasyon yazıcı konfigürasyonları
        this.stations = {
            kitchen: {
                name: 'Mutfak',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON,
                codePage: 'CP857', // Türkçe
                characterSet: CharacterSet.PC857_TURKISH
            },
            bar: {
                name: 'Bar',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON,
                codePage: 'CP857',
                characterSet: CharacterSet.PC857_TURKISH
            },
            cashier: {
                name: 'Kasa',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON,
                codePage: 'CP857',
                characterSet: CharacterSet.PC857_TURKISH
            },
            grill: {
                name: 'Izgara',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON,
                codePage: 'CP857',
                characterSet: CharacterSet.PC857_TURKISH
            },
            dessert: {
                name: 'Tatlı',
                ip: null,
                port: 9100,
                enabled: false,
                type: PrinterTypes.EPSON,
                codePage: 'CP857',
                characterSet: CharacterSet.PC857_TURKISH
            }
        };
    }

    /**
     * Metni yazıcının desteklediği karakterlere çevir
     */
    encodeText(text, codePage = 'CP857') {
        try {
            // iconv-lite ile encode et
            if (iconv.encodingExists(codePage)) {
                const encoded = iconv.encode(text, codePage);
                return encoded.toString('binary');
            }
        } catch (error) {
            console.warn('Encoding error, using fallback:', error);
        }
        // Fallback: Manuel karakter değişimi
        return this.convertTurkishChars(text);
    }

    /**
     * Türkçe karakterleri manuel olarak çevir (CP857)
     */
    convertTurkishChars(text) {
        let converted = text;
        Object.keys(this.turkishCharMap).forEach(char => {
            converted = converted.replace(new RegExp(char, 'g'), this.turkishCharMap[char]);
        });
        return converted;
    }

    /**
     * Çince karakterler için transliteration (fallback)
     */
    transliterateText(text, language = 'tr') {
        // Türkçe için
        if (language === 'tr') {
            const map = {
                'ç': 'c', 'Ç': 'C',
                'ğ': 'g', 'Ğ': 'G',
                'ı': 'i', 'İ': 'I',
                'ö': 'o', 'Ö': 'O',
                'ş': 's', 'Ş': 'S',
                'ü': 'u', 'Ü': 'U'
            };
            let result = text;
            Object.keys(map).forEach(char => {
                result = result.replace(new RegExp(char, 'g'), map[char]);
            });
            return result;
        }

        // Çince için (pinyin benzeri basitleştirme)
        if (language === 'zh') {
            // Bu kısım için bir Çince-Pinyin kütüphanesi kullanılabilir
            // Şimdilik sadece uyarı ver
            console.warn('⚠️ Çince karakterler destekleniyor ama yazıcı GB18030 code page gerektiriyor');
            return text;
        }

        return text;
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
     * Sipariş fişi yazdır (Gelişmiş - Türkçe destekli)
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
                characterSet: stationConfig.characterSet || CharacterSet.PC857_TURKISH,
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

            // Code Page ayarla (CP857 - Türkçe)
            printer.setCharacterSet(stationConfig.characterSet || CharacterSet.PC857_TURKISH);

            printer.alignCenter();
            printer.bold(true);
            printer.setTextDoubleHeight();

            // İstasyon adını encode et
            const stationName = this.encodeText(stationConfig.name.toUpperCase(), stationConfig.codePage);
            printer.println(stationName);

            printer.setTextNormal();
            printer.bold(false);
            printer.drawLine();
            printer.newLine();

            // Sipariş bilgileri
            printer.alignLeft();
            printer.println(`Siparis No: ${orderData.orderNumber}`);
            printer.println(`Masa: ${orderData.tableNumber}`);
            printer.println(`Tarih: ${new Date().toLocaleString('tr-TR')}`);
            printer.drawLine();
            printer.newLine();

            // Ürünler
            printer.bold(true);
            const productsHeader = this.encodeText('URUNLER:', stationConfig.codePage);
            printer.println(productsHeader);
            printer.bold(false);
            printer.newLine();

            orderData.items.forEach(item => {
                printer.bold(true);

                // Ürün adını encode et
                const itemName = this.encodeText(item.name, stationConfig.codePage);
                printer.println(`${item.quantity}x ${itemName}`);

                printer.bold(false);

                if (item.notes) {
                    const notes = this.encodeText(`   NOT: ${item.notes}`, stationConfig.codePage);
                    printer.println(notes);
                }

                printer.newLine();
            });

            printer.drawLine();
            printer.newLine();
            printer.alignCenter();
            printer.bold(true);

            const footer = this.encodeText('AFIYET OLSUN!', stationConfig.codePage);
            printer.println(footer);

            printer.bold(false);
            printer.newLine();
            printer.newLine();
            printer.cut();

            await printer.execute();
            console.log(`✅ ${station} yazıcısına yazdırıldı (Türkçe karakter destekli)`);

            return { success: true };

        } catch (error) {
            console.error(`❌ ${station} yazıcı hatası:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test yazdırma (Türkçe karakterlerle)
     */
    async printTest(station) {
        const testOrder = {
            orderNumber: 'TEST-' + Date.now(),
            tableNumber: 'TEST-MASA',
            items: [
                {
                    quantity: 1,
                    name: 'Çiğ Köfte - Özel Şişli',
                    notes: 'Yoğurtlu ve acılı sos'
                },
                {
                    quantity: 2,
                    name: 'İçli Köfte',
                    notes: 'Ekstra bulgur'
                },
                {
                    quantity: 1,
                    name: 'Künefe - Fıstıklı',
                    notes: 'Üstüne maraş dondurması'
                }
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
                port: stationConfig.port,
                codePage: stationConfig.codePage,
                characterSet: stationConfig.characterSet
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
