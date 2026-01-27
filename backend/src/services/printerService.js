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

        // İstasyon yazıcı konfigürasyonları - Kroren Ana Mutfak & İçecek İstasyonları
        this.stations = {
            kavurma: {
                name: 'KAVURMA',
                ip: '192.168.10.194',
                port: 9100,
                enabled: true,
                type: PrinterTypes.EPSON,
                characterSet: CharacterSet.PC857_TURKISH,
                codePage: 'CP857'
            },
            manti: {
                name: 'MANTI',
                ip: '192.168.10.199',
                port: 9100,
                enabled: true,
                type: PrinterTypes.EPSON,
                characterSet: CharacterSet.PC857_TURKISH,
                codePage: 'CP857'
            },
            ramen: {
                name: 'RAMEN',
                ip: '192.168.10.197',
                port: 9100,
                enabled: true,
                type: PrinterTypes.EPSON,
                characterSet: CharacterSet.PC857_TURKISH,
                codePage: 'CP857'
            },
            icecek1: {
                name: '1 Kat İçecek',
                ip: '', // Manuel girilecek
                port: 9100,
                enabled: true,
                type: PrinterTypes.EPSON,
                characterSet: CharacterSet.PC857_TURKISH,
                codePage: 'CP857'
            },
            icecek2: {
                name: '2. Kat İçecek',
                ip: '', // Manuel girilecek
                port: 9100,
                enabled: true,
                type: PrinterTypes.EPSON,
                characterSet: CharacterSet.PC857_TURKISH,
                codePage: 'CP857'
            }
        };
    }

    /**
     * Yerel IP kontrolü
     */
    isLocalIP(ip) {
        if (!ip) return false;
        // 192.168.x.x, 10.x.x.x, 172.16-31.x.x, 127.0.0.1, localhost
        const ipStr = String(ip);
        return ipStr.startsWith('192.168.') ||
            ipStr.startsWith('10.') ||
            ipStr.startsWith('127.0.0.1') ||
            ipStr === 'localhost' ||
            (ipStr.startsWith('172.') && parseInt(ipStr.split('.')[1]) >= 16 && parseInt(ipStr.split('.')[1]) <= 31);
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
     * Yeni istasyon ekle veya güncelle
     */
    addOrUpdateStation(stationId, config) {
        this.stations[stationId] = {
            ...this.stations[stationId],
            ...config
        };
    }

    /**
     * Metni belirtilen dile çevir
     */
    async translateProductName(text, targetLanguage = 'zh') {
        if (targetLanguage === 'zh') {
            // Önce hazır çeviri sözlüğünden bak
            try {
                const chineseNames = require('../data/chinese_product_names');
                if (chineseNames[text]) {
                    console.log(`✅ Çince çeviri bulundu: ${text} → ${chineseNames[text]}`);
                    return chineseNames[text];
                }
            } catch (error) {
                console.warn('⚠️ Çince çeviri sözlüğü yüklenemedi:', error.message);
            }
        }

        // Çeviri bulunamadı, orijinal metni döndür
        // Gelecekte buraya DeepL veya Google Translate API eklenebilir
        return text;
    }

    /**
     * Sipariş fişi yazdır (Gelişmiş - Çok dilli destekli)
     */
    async printOrderAdvanced(station, orderData) {
        const stationConfig = this.stations[station];

        if (!stationConfig || !stationConfig.enabled || !stationConfig.ip) {
            console.log(`⚠️ ${station} yazıcısı devre dışı veya IP tanımlı değil`);
            return { success: false, error: 'Printer not configured' };
        }

        // Cloud ortamında yerel IP kontrolü
        const isCloud = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
        if (isCloud && this.isLocalIP(stationConfig.ip)) {
            console.log(`ℹ️ [CLOUD] Yerel IP tespiti: ${stationConfig.ip}. Bulut sunucusu yerel ağdaki yazıcıya doğrudan erişemez.`);
            return {
                success: false,
                error: `Yazıcı yerel bir IP adresine sahip (${stationConfig.ip}). Bulut sunucu doğrudan bağlanamaz. Lütfen 'Yerel Köprü' (Local Bridge) kullanın.`,
                isLocalIP: true,
                ip: stationConfig.ip
            };
        }

        try {
            // Dil ayarını al (varsayılan: Türkçe)
            const language = stationConfig.language || 'tr';

            // Dile göre character set belirle
            let characterSet = CharacterSet.PC857_TURKISH;
            let codePage = 'CP857';

            if (language === 'zh') {
                // Çince için GB18030 kullan
                characterSet = CharacterSet.PC936_CHINESE;
                codePage = 'GB18030';
            }

            const printer = new ThermalPrinter({
                type: stationConfig.type,
                interface: `tcp://${stationConfig.ip}:${stationConfig.port}`,
                characterSet: characterSet,
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

            // Code Page ayarla
            printer.setCharacterSet(characterSet);

            printer.alignCenter();
            printer.bold(true);
            printer.setTextDoubleHeight();

            // İstasyon adını encode et
            const stationName = this.encodeText(stationConfig.name.toUpperCase(), codePage);
            printer.println(stationName);

            printer.setTextNormal();
            printer.bold(false);
            printer.drawLine();
            printer.newLine();

            // Sipariş bilgileri - Dile göre
            printer.alignLeft();

            if (language === 'zh') {
                printer.println(`订单号: ${orderData.orderNumber}`);
                printer.println(`桌号: ${orderData.tableNumber}`);
                printer.println(`时间: ${new Date().toLocaleString('zh-CN')}`);
            } else {
                printer.println(`Siparis No: ${orderData.orderNumber}`);
                printer.println(`Masa: ${orderData.tableNumber}`);
                printer.println(`Tarih: ${new Date().toLocaleString('tr-TR')}`);
            }

            printer.drawLine();
            printer.newLine();

            // Ürünler
            printer.bold(true);
            const productsHeader = language === 'zh' ? '产品:' : 'URUNLER:';
            const productsHeaderEncoded = this.encodeText(productsHeader, codePage);
            printer.println(productsHeaderEncoded);
            printer.bold(false);
            printer.newLine();

            for (const item of orderData.items) {
                printer.bold(true);

                // Ürün adını dile göre çevir
                let itemName = item.name;
                if (language === 'zh' && item.nameChinese) {
                    // Eğer ürünün Çince adı varsa onu kullan
                    itemName = item.nameChinese;
                } else if (language === 'zh') {
                    // Yoksa çevir (gelecekte API ile)
                    itemName = await this.translateProductName(item.name, 'zh');
                }

                const itemNameEncoded = this.encodeText(itemName, codePage);
                printer.println(`${item.quantity}x ${itemNameEncoded}`);

                printer.bold(false);

                if (item.notes) {
                    const noteLabel = language === 'zh' ? '备注: ' : 'NOT: ';
                    const notes = this.encodeText(`   ${noteLabel}${item.notes}`, codePage);
                    printer.println(notes);
                }

                printer.newLine();
            }

            printer.drawLine();
            printer.newLine();
            printer.alignCenter();
            printer.bold(true);

            const footer = language === 'zh' ? '请享用!' : 'AFIYET OLSUN!';
            const footerEncoded = this.encodeText(footer, codePage);
            printer.println(footerEncoded);

            printer.bold(false);
            printer.newLine();
            printer.newLine();
            printer.cut();

            await printer.execute();
            console.log(`✅ ${station} yazıcısına yazdırıldı (${language === 'zh' ? 'Çince' : 'Türkçe'} karakter destekli)`);

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
                    quantity: 2,
                    name: 'Çiğ Köfte - Özel Şişli',
                    notes: 'Yoğurtlu ve acılı sos'
                },
                {
                    quantity: 1,
                    name: 'İçli Köfte',
                    notes: 'Ekstra bulgur'
                },
                {
                    quantity: 3,
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

        // Cloud ortamında yerel IP kontrolü
        const isCloud = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
        if (isCloud && this.isLocalIP(stationConfig.ip)) {
            return {
                connected: false,
                error: `Yerel IP tespiti (${stationConfig.ip}). Bulut üzerinden kontrol edilemez.`,
                isLocalIP: true,
                ip: stationConfig.ip
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
