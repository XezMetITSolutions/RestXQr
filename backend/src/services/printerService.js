
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Ödeme yöntemi, bahşiş ve bağış bilgilerini notlardan temizle
 */
function cleanNotes(notes) {
    if (!notes) return notes;
    return notes
        .replace(/Ödeme(\s+yöntemi)?:\s*[^,|]+(,\s*|\|\s*)?/gi, '')
        .replace(/Bahşiş:\s*[^,|]+(,\s*|\|\s*)?/gi, '')
        .replace(/Bağış:\s*[^,|]+(,\s*|\|\s*)?/gi, '')
        .replace(/Debug\s+Simülasyonu\s*-\s*Ödeme:\s*[^,|]+(,\s*|\|\s*)?/gi, '')
        .replace(/^\s*📝\s*(Özel\s+)?NOT:\s*/i, '')
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*/, '')
        .replace(/,\s*$/, '')
        .trim();
}

/**
 * Thermal Printer Service
 * Her istasyon için farklı yazıcı desteği
 * Türkçe ve Çince karakter desteği ile
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

        // Arka planda global stations tutmaya gerek yok (artık DB'den gelecek)
        this.stations = {};
    }

    /**
     * Yerel IP kontrolü
     */
    isLocalIP(ip) {
        if (!ip) return false;
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
            if (iconv.encodingExists(codePage)) {
                const encoded = iconv.encode(text, codePage);
                return encoded.toString('binary');
            }
        } catch (error) {
            console.warn('Encoding error, using fallback:', error);
        }
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
     * Sipariş fişi yazdır (Gelişmiş - Çok dilli destekli)
     * @param {Object} printerConfig Yazıcı konfigürasyonu {ip, port, type, enabled, language...}
     * @param {Object} orderData Sipariş verisi
     */
    async printOrderWithConfig(printerConfig, orderData) {
        if (!printerConfig || !printerConfig.enabled || !printerConfig.ip) {
            return { success: false, error: 'Printer not configured' };
        }

        // Cloud ortamında yerel IP kontrolü
        const isCloud = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
        if (isCloud && this.isLocalIP(printerConfig.ip)) {
            return {
                success: false,
                error: `Yazıcı yerel bir IP adresine sahip (${printerConfig.ip}). Bulut sunucu doğrudan bağlanamaz.`,
                isLocalIP: true,
                ip: printerConfig.ip
            };
        }

        try {
            const language = printerConfig.language || 'tr';
            let characterSet = CharacterSet.PC857_TURKISH;
            let codePage = 'CP857';

            if (language === 'zh') {
                characterSet = CharacterSet.PC936_CHINESE;
                codePage = 'GB18030';
            }

            const printer = new ThermalPrinter({
                type: printerConfig.type || PrinterTypes.EPSON,
                interface: `tcp://${printerConfig.ip}:${printerConfig.port || 9100}`,
                characterSet: characterSet,
                removeSpecialCharacters: false,
                lineCharacter: '-',
                options: { timeout: 5000 }
            });

            const isConnected = await printer.isPrinterConnected();
            if (!isConnected) throw new Error('Printer not connected');

            printer.setCharacterSet(characterSet);
            printer.setTypeFontB(); // Use smaller font
            printer.alignCenter();
            printer.bold(true);

            // Normal boyut - küçük font
            const tableHeader = language === 'zh' ? `桌号: ${orderData.tableNumber}` : `MASA: ${orderData.tableNumber}`;
            printer.println(this.encodeText(tableHeader, codePage));

            printer.bold(false);
            const stationName = this.encodeText(`[ ${(printerConfig.name || 'MUTFAK').toUpperCase()} ]`, codePage);
            printer.println(stationName);

            printer.bold(false);
            printer.drawLine();
            printer.newLine();

            printer.alignLeft();
            if (language === 'zh') {
                printer.println(`时间: ${new Date().toLocaleString('zh-CN')}`);
            } else {
                printer.println(`Tarih: ${new Date().toLocaleString('tr-TR')}`);
            }

            printer.drawLine();
            printer.newLine();

            printer.setTextNormal();
            printer.bold(true);
            const detailLabel = language === 'zh' ? '订单详情:' : 'SIPARIS DETAYI:';
            printer.println(this.encodeText(detailLabel, codePage));
            printer.bold(false);
            printer.newLine();

            for (const item of orderData.items) {
                // Ürün adı - normal boyut
                let itemName = item.name;
                if (language === 'zh' && item.translations?.zh?.name) {
                    itemName = item.translations.zh.name;
                } else if (language === 'zh' && item.nameChinese) {
                    itemName = item.nameChinese;
                }

                const itemNameEncoded = this.encodeText(itemName, codePage);
                printer.println(`${item.quantity}x ${itemNameEncoded}`);

                // Varyasyonları yazdır (Seçenekler: Az acılı, Büyük porsiyon vb.)
                if (item.variations && Array.isArray(item.variations) && item.variations.length > 0) {
                    const variationText = item.variations
                        .map(v => typeof v === 'string' ? v : (v.name || v.value))
                        .join(', ');
                    printer.println(this.encodeText(`   > ${variationText}`, codePage));
                }

                if (item.notes) {
                    printer.bold(true);
                    const noteLabel = language === 'zh' ? '备注: ' : 'NOT: ';
                    printer.println(this.encodeText(`   !! ${noteLabel}${item.notes}`, codePage));
                    printer.bold(false);
                }
                printer.newLine();
            }

            printer.setTextNormal();

            // Genel Sipariş Notu (Ödeme bilgileri temizlenmiş)
            const generalNote = cleanNotes(orderData.notes);
            if (generalNote) {
                printer.drawLine();
                printer.bold(true);
                printer.println(this.encodeText(`GENEL NOT: ${generalNote}`, codePage));
                printer.bold(false);
                printer.newLine();
            }

            printer.drawLine();
            printer.newLine();
            printer.alignCenter();
            printer.bold(true);

            const footer = language === 'zh' ? '请享用!' : 'AFIYET OLSUN!';
            printer.println(this.encodeText(footer, codePage));

            printer.bold(false);
            printer.newLine();
            printer.newLine();
            printer.cut();

            await printer.execute();
            return { success: true };

        } catch (error) {
            console.error(`❌ Yazıcı hatası:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sipariş fişi yazdır (Legacy support - for backward compatibility)
     */
    async printOrderAdvanced(stationId, orderData) {
        // Eğer stations içinde varsa kullan, yoksa hata
        const config = this.stations[stationId];
        if (!config) return { success: false, error: 'Station not found' };
        return await this.printOrderWithConfig(config, orderData);
    }

    /**
     * Bilgi Fişi Yazdır (Kasa için)
     */
    async printInformationReceipt(printerConfig, orderData, restaurant = null) {
        if (!printerConfig || !printerConfig.enabled || !printerConfig.ip) {
            return { success: false, error: 'Printer not configured' };
        }

        try {
            const printer = new ThermalPrinter({
                type: printerConfig.type || PrinterTypes.EPSON,
                interface: `tcp://${printerConfig.ip}:${printerConfig.port || 9100}`,
                characterSet: CharacterSet.PC857_TURKISH,
                removeSpecialCharacters: false,
                lineCharacter: '-',
                options: { timeout: 5000 }
            });

            const isConnected = await printer.isPrinterConnected();
            if (!isConnected) throw new Error('Printer not connected');

            const restaurantName = restaurant?.name || orderData.restaurantName || 'RESTORAN';
            const restaurantSettings = restaurant?.settings || {};
            const printerSettings = restaurantSettings?.printerSettings || {};
            const brandingSettings = restaurantSettings?.branding || {};
            const showLogo = printerSettings.showLogo !== false;
            const logoUrl = restaurant?.logo || brandingSettings?.logo;

            printer.alignCenter();

            if (showLogo && logoUrl) {
                try {
                    let logoPath = null;
                    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
                        const tempDir = path.join(__dirname, '../../temp');
                        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                        const ext = path.extname(new URL(logoUrl).pathname) || '.png';
                        const tempLogoPath = path.join(tempDir, `logo_${Date.now()}${ext}`);

                        await new Promise((resolve, reject) => {
                            const protocol = logoUrl.startsWith('https://') ? https : http;
                            const file = fs.createWriteStream(tempLogoPath);
                            protocol.get(logoUrl, res => {
                                if (res.statusCode !== 200) reject(new Error(`HTTP ${res.statusCode}`));
                                res.pipe(file);
                                file.on('finish', () => { file.close(); resolve(); });
                            }).on('error', err => { fs.unlinkSync(tempLogoPath).catch(() => { }); reject(err); });
                        });
                        logoPath = tempLogoPath;
                    } else {
                        logoPath = path.isAbsolute(logoUrl) ? logoUrl : path.join(__dirname, '../../', logoUrl);
                    }

                    if (logoPath && fs.existsSync(logoPath)) {
                        await printer.printImage(logoPath);
                        if (logoPath.includes('/temp/logo_')) fs.unlinkSync(logoPath).catch(() => { });
                    } else {
                        printer.bold(true);
                        printer.println(this.encodeText(restaurantName));
                        printer.bold(false);
                    }
                } catch (e) {
                    printer.bold(true);
                    printer.println(this.encodeText(restaurantName));
                    printer.bold(false);
                }
            } else {
                printer.bold(true);
                printer.println(this.encodeText(restaurantName));
                printer.bold(false);
            }

            printer.newLine();
            printer.bold(true);
            printer.println(this.encodeText(restaurantName));
            printer.bold(false);
            printer.drawLine();

            printer.alignLeft();
            printer.println(`Cek : ${String(orderData.orderNumber || '').substring(0, 8)}`);
            printer.println(`Masa: MASA - ${orderData.tableNumber}`);
            printer.newLine();

            const now = new Date();
            printer.tableCustom([
                { text: 'Tarih', align: 'LEFT', width: 0.5 },
                { text: `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`, align: 'RIGHT', width: 0.5 }
            ]);

            printer.tableCustom([
                { text: 'Kullanici', align: 'LEFT', width: 0.5 },
                { text: orderData.cashierName || 'Kasiyer', align: 'RIGHT', width: 0.5 }
            ]);

            printer.drawLine();

            let subtotal = 0;
            for (const item of orderData.items) {
                const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
                subtotal += itemTotal;
                printer.println(`${item.quantity} x ${this.encodeText(item.name)}`);
            }

            printer.bold(true);
            printer.tableCustom([
                { text: 'ARA TOPLAM', align: 'LEFT', width: 0.5 },
                { text: `${subtotal.toFixed(2)} TL`, align: 'RIGHT', width: 0.5 }
            ]);
            printer.bold(false);
            printer.drawLine();

            const taxRate = 0.10;
            const taxAmount = subtotal - (subtotal / (1 + taxRate));
            const netAmount = subtotal - taxAmount;

            printer.println(this.encodeText(`KDV (%10)`));
            printer.tableCustom([
                { text: `${subtotal.toFixed(2)} TL`, align: 'LEFT', width: 0.4 },
                { text: `${taxAmount.toFixed(2)} KDV`, align: 'CENTER', width: 0.3 },
                { text: `${netAmount.toFixed(2)} NET`, align: 'RIGHT', width: 0.3 }
            ]);

            printer.bold(true);
            printer.tableCustom([
                { text: 'TOPLAM', align: 'LEFT', width: 0.5 },
                { text: `${subtotal.toFixed(2)} TL`, align: 'RIGHT', width: 0.5 }
            ]);
            printer.bold(false);
            printer.drawLine();

            printer.newLine();
            printer.cut();

            await printer.execute();
            return { success: true };
        } catch (error) {
            console.error(`❌ Bilgi fişi yazdırma hatası:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test yazdırma
     */
    async printTest(printerConfig) {
        const testOrder = {
            orderNumber: 'TEST-' + Date.now(),
            tableNumber: 'TEST',
            items: [
                { quantity: 1, name: 'Test Ürünü - Türkçe', notes: 'Türkçe karakter testi: ğüşiöç' },
                { quantity: 2, name: '测试产品 - 中文', nameChinese: '测试产品', notes: 'Çince karakter testi' }
            ]
        };
        return await this.printOrderWithConfig(printerConfig, testOrder);
    }

    /**
     * Yazıcı durumunu kontrol et
     */
    async checkPrinterStatusDirect(printerConfig) {
        if (!printerConfig || !printerConfig.ip) {
            return { connected: false, error: 'Printer not configured' };
        }

        const isCloud = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
        if (isCloud && this.isLocalIP(printerConfig.ip)) {
            return { connected: false, error: `Yerel IP (${printerConfig.ip}). Bulut üzerinden ulaşılamaz.`, isLocalIP: true };
        }

        try {
            const printer = new ThermalPrinter({
                type: printerConfig.type || PrinterTypes.EPSON,
                interface: `tcp://${printerConfig.ip}:${printerConfig.port || 9100}`,
                options: { timeout: 3000 }
            });

            const isConnected = await printer.isPrinterConnected();
            return { connected: isConnected, ip: printerConfig.ip, name: printerConfig.name };
        } catch (error) {
            return { connected: false, error: error.message };
        }
    }

    // For backward compatibility while refactoring
    addOrUpdateStation(id, config) {
        this.stations[id] = config;
    }
}

const printerService = new PrinterService();
module.exports = printerService;
