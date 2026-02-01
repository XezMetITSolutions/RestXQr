const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');

const app = express();
const PORT = 3005;

// Enable CORS for the cloud frontend
app.use(cors({
    origin: '*', // Allow all origins for simplicity in local bridge
    methods: ['GET', 'POST']
}));

app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Explicit OPTIONS handler for CORS preflight
app.options('*', cors());


// ESC/POS Commands
const CMD = {
    CP857: Buffer.from([0x1B, 0x74, 13]),      // ESC t 13 -> PC857
    GB18030_ON: Buffer.from([0x1C, 0x26]),      // FS & -> Kanji ON (GB18030)
    GB18030_OFF: Buffer.from([0x1C, 0x2E]),     // FS . -> Kanji OFF
    UTF8_ON: Buffer.from([0x1D, 0x28, 0x47, 0x03, 0x00, 0x30, 0x01, 0x02]), // UTF8 ON (if supported)
    RESET: Buffer.from([0x1B, 0x40])            // ESC @ -> Init
};

function encodeText(text, encoding = 'cp857') {
    // For Turkish CP857, we might want to use the manual map as a fallback 
    // because some printers have slight variations. But iconv-lite is generally better.
    try {
        if (encoding === 'cp857') {
            // First try manual map for critical Turkish chars (most reliable on cheap clones)
            let mapped = text;
            Object.keys(turkishCharMap).forEach(char => {
                mapped = mapped.replace(new RegExp(char, 'g'), turkishCharMap[char]);
            });
            return Buffer.from(mapped, 'binary');
        }
        return iconv.encode(text, encoding);
    } catch (e) {
        console.error("Encoding error:", e);
        return Buffer.from(text);
    }
}

/**
 * Helper to find the correct UNC path for a shared printer
 * Tries: \\HOSTNAME\Printer, \\localhost\Printer, \\127.0.0.1\Printer
 */
async function resolveWindowsPrinterPath(printerName) {
    console.log(`🔎 Resolving path for printer '${printerName}'...`);

    // User shared printer as "KASA" (Uppercase).
    const shareName = printerName.toUpperCase();

    const candidates = [
        // 1. Localhost variations (Confirmed by Get-SmbShare as locally shared)
        `\\\\localhost\\${shareName}`,
        `\\\\127.0.0.1\\${shareName}`,

        // 2. Explicit IP (if networked access needed)
        `\\\\192.168.1.119\\${shareName}`,

        // 3. Hostname based
        `\\\\${os.hostname()}\\${shareName}`,
        `\\\\Kasa\\${shareName}`
    ];

    for (const candidate of candidates) {
        try {
            await fs.promises.access(candidate, fs.constants.W_OK);
            console.log(`✅ Found accessible printer path: ${candidate}`);
            return candidate;
        } catch (e) {
            // console.log(`   - Path failed: ${candidate} (${e.code})`);
        }
    }

    // If UNC paths fail, fallback to using the DRIVER directly.
    // The test results showed "printer:KASA" was valid (green).
    console.warn(`⚠️ UNC paths failed. Fallback to DRIVER mode: printer:${shareName}`);
    return `printer:${shareName}`;
}

// Health check endpoint
app.get('/debug/health', (req, res) => {
    res.json({ success: true, message: 'Local Bridge is running', timestamp: new Date().toISOString() });
});

// Test connection endpoint
app.post('/debug/test-connection', async (req, res) => {
    const { ip, port = 9100 } = req.body;
    console.log(`🔌 Testing connection to ${ip}:${port}...`);

    try {
        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: `tcp://${ip}:${port}`,
            options: { timeout: 3000 }
        });

        const isConnected = await printer.isPrinterConnected();
        if (isConnected) {
            console.log(`✅ Connection successful: ${ip}:${port}`);
            res.json({ success: true, message: 'Yazıcı bağlantısı başarılı' });
        } else {
            console.log(`❌ Connection failed: ${ip}:${port}`);
            res.json({ success: false, error: 'Yazıcıya ulaşılamıyor' });
        }
    } catch (error) {
        console.error(`❌ Connection error: ${error.message}`);
        res.json({ success: false, error: error.message });
    }
});

// Font size test print endpoint
app.post('/debug/print-font-test', async (req, res) => {
    const { ip, port = 9100, fontConfig, sizeName, sizeDescription } = req.body;
    console.log(`🖨️ Font Test: ${sizeName} - IP: ${ip}:${port}`);

    try {
        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: `tcp://${ip}:${port}`,
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

// Check status endpoint
app.get('/status/:ip', async (req, res) => {
    const { ip } = req.params;
    console.log(`Checking status for printer at ${ip}...`);

    try {
        const isWindowsPrinter = !ip.includes('.') && ip !== 'localhost';

        if (isWindowsPrinter) {
            const printerPath = await resolveWindowsPrinterPath(ip);
            console.log(`Checking file access for local printer: ${printerPath}`);
            try {
                await fs.promises.access(printerPath, fs.constants.W_OK);
                console.log(`✅ Printer at ${ip} is ACCESSIBLE (Shared)`);
                return res.json({ success: true, connected: true, message: "Printer accessible" });
            } catch (fileErr) {
                console.log(`❌ Printer at ${ip} is NOT accessible via any path.`);
                return res.json({ success: true, connected: false, error: "Printer not accessible (Check URL/Sharing)" });
            }
        }

        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: `tcp://${ip}:9100`,
            options: { timeout: 3000 }
        });

        const isConnected = await printer.isPrinterConnected();

        if (isConnected) {
            console.log(`✅ Printer at ${ip} is CONNECTED`);
            res.json({ success: true, connected: true, message: "Printer connected" });
        } else {
            console.log(`❌ Printer at ${ip} is NOT connected`);
            res.json({ success: true, connected: false, error: "Printer unreachable" });
        }
    } catch (error) {
        console.error('Status check error:', error);
        res.json({ success: false, connected: false, error: error.message });
    }
});

// Test print endpoint
app.post('/test/:ip', async (req, res) => {
    const { ip } = req.params;
    console.log(`Received TEST print request for ${ip}`);

    try {
        const isWindowsPrinter = !ip.includes('.') && ip !== 'localhost';
        let printerInterface;

        if (isWindowsPrinter) {
            printerInterface = await resolveWindowsPrinterPath(ip);
        } else {
            printerInterface = `tcp://${ip}:9100`;
        }

        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: printerInterface,
            characterSet: CharacterSet.PC857_TURKISH,
            removeSpecialCharacters: false,
            lineCharacter: '-',
            options: {
                timeout: isWindowsPrinter ? 1000 : 5000
            }
        });

        if (!isWindowsPrinter) {
            const isConnected = await printer.isPrinterConnected();
            if (!isConnected) {
                throw new Error("Printer not connected");
            }
        }

        printer.alignCenter();
        printer.setTextDoubleHeight();
        printer.bold(true);
        printer.add(CMD.CP857);
        printer.add(encodeText("MASA 15"));
        printer.bold(false);
        printer.setTextNormal();
        printer.println(new Date().toLocaleString('tr-TR'));
        printer.drawLine();
        printer.newLine();

        // Simple text test
        printer.alignLeft();
        printer.println("TEST PRINT SUCCESSFUL");
        printer.println("--------------------------------");
        printer.println("Path: " + (isWindowsPrinter ? printerInterface : ip));
        printer.println("Date: " + new Date().toLocaleDateString());
        printer.println("Time: " + new Date().toLocaleTimeString());
        printer.println("--------------------------------");

        const testItems = [
            { tr: "Ramen", zh: "什锦拉面", qty: 2, note: "Acılı" },
            { tr: "Mantı", zh: "饺子", qty: 3, note: "Acısız" }
        ];

        for (const item of testItems) {
            // Line 1: Quantity + Turkish Name
            printer.bold(true);
            printer.add(CMD.CP857);
            printer.add(encodeText(`${item.qty}x ${item.tr}\n`));

            // Line 2: Chinese Name
            printer.bold(false);
            printer.add(CMD.GB18030_ON);
            printer.add(encodeText(`   ${item.zh}\n`, 'gb18030'));
            printer.add(CMD.GB18030_OFF);

            // Line 3: Notes
            if (item.note) {
                printer.add(CMD.CP857);
                printer.add(encodeText(`   ⚠ ${item.note}\n`));
            }
            printer.drawLine();
        }

        printer.newLine();

        printer.alignCenter();
        printer.setTextSize(0, 0);
        printer.add(CMD.CP857);
        printer.add(encodeText(`Local Bridge Test - ${ip}\n`));

        printer.cut();

        try {
            await printer.execute();
            console.log("✅ Test print successful");
            res.json({ success: true, message: "Test print sent successfully" });
        } catch (execError) {
            console.error("Execute error:", execError);
            throw new Error("Printer execution failed: " + execError.message);
        }
    } catch (error) {
        console.error("Print error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generic print endpoint for orders
app.post('/print/:ip', async (req, res) => {
    const { ip } = req.params;
    const { orderNumber, tableNumber, items, type: printType = 'epson' } = req.body;

    console.log(`Received PRINT request for ${ip} (Order: ${orderNumber})`);

    try {
        let printer;

        // USB/Local Printer Support
        const isWindowsPrinter = !ip.includes('.') && ip !== 'localhost';
        let printerInterface;

        if (isWindowsPrinter) {
            printerInterface = await resolveWindowsPrinterPath(ip);
            console.log(`🖨️ Printing to LOCAL Windows printer: ${printerInterface}`);
        } else {
            printerInterface = `tcp://${ip}:9100`;
        }

        printer = new ThermalPrinter({
            type: printType === 'star' ? PrinterTypes.STAR : PrinterTypes.EPSON,
            interface: printerInterface,
            characterSet: CharacterSet.PC857_TURKISH,
            removeSpecialCharacters: false,
            lineCharacter: '-',
            options: { timeout: isWindowsPrinter ? 1000 : 5000 }
        });

        if (!isWindowsPrinter) {
            const isConnected = await printer.isPrinterConnected();
            if (!isConnected) throw new Error("Printer unreachable");
        }

        // Format Kitchen Receipt
        printer.alignCenter();
        printer.setTextDoubleHeight();
        printer.bold(true);
        printer.add(CMD.CP857);
        printer.add(encodeText(`MASA ${tableNumber || '?'}`));
        printer.bold(false);
        printer.setTextNormal();
        printer.println(new Date().toLocaleString('tr-TR'));
        printer.add(CMD.CP857);
        printer.add(encodeText(`Siparis No: ${orderNumber}\n`));
        printer.drawLine();
        printer.newLine();

        printer.alignLeft();
        for (const item of items) {
            // Turkish Name
            printer.bold(true);
            printer.add(CMD.CP857);
            printer.add(encodeText(`${item.quantity}x ${item.name}\n`));

            // Chinese Name (if available)
            const chineseName = item.translations?.zh?.name || item.nameChinese;
            if (chineseName) {
                printer.bold(false);
                printer.add(CMD.GB18030_ON);
                printer.add(encodeText(`   ${chineseName}\n`, 'gb18030'));
                printer.add(CMD.GB18030_OFF);
            }

            // Notes (Turkish)
            printer.bold(false);
            if (item.notes) {
                printer.add(CMD.CP857);
                printer.add(encodeText(`   NOT: ${item.notes}\n`));
            }
            printer.newLine();
        }

        printer.drawLine();
        printer.alignCenter();
        printer.println("Afiyet Olsun!");
        printer.cut();

        await printer.execute();
        console.log(`✅ Printed Order ${orderNumber} to ${ip}`);
        res.json({ success: true });

    } catch (error) {
        console.error("Print error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Image print endpoint (Base64)
app.post('/print-image/:ip', async (req, res) => {
    const { ip } = req.params;
    const { image } = req.body; // Expecting base64 string (data:image/png;base64,...)

    if (!image) {
        return res.status(400).json({ success: false, error: "No image provided" });
    }

    console.log(`Received IMAGE print request for ${ip}`);

    const tempFilePath = path.join(__dirname, `temp_print_${Date.now()}.png`);

    try {
        // Save base64 to file
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(tempFilePath, base64Data, 'base64');
        console.log(`Image saved to ${tempFilePath}`);

        let printer;
        const isWindowsPrinter = !ip.includes('.') && ip !== 'localhost';
        let printerInterface;

        if (isWindowsPrinter) {
            printerInterface = await resolveWindowsPrinterPath(ip);
            console.log(`🖨️ Printing IMAGE to LOCAL shared printer: ${printerInterface}`);
        } else {
            printerInterface = `tcp://${ip}:9100`;
        }

        printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: printerInterface,
            options: { timeout: isWindowsPrinter ? 1000 : 10000 }
        });

        // Print the image
        await printer.printImage(tempFilePath);
        printer.cut();

        try {
            await printer.execute();
            console.log("✅ Image print successful");
            res.json({ success: true, message: "Image printed successfully" });
        } catch (execError) {
            console.error("Execute error:", execError);
            throw new Error("Printer execution failed: " + execError.message);
        }

    } catch (error) {
        console.error("Image print error:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        // Cleanup temp file
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
                console.log("Temp file cleaned up");
            } catch (cleanupError) {
                console.error("Failed to delete temp file:", cleanupError);
            }
        }
    }
});

// Debug endpoint to simulate cloud routing locally
app.post('/debug/print-stations', async (req, res) => {
    try {
        const { orderNumber, tableNumber, items, printerConfig } = req.body;
        console.log(`Received DEBUG print-stations request for Order ${orderNumber}`);

        if (!items || !printerConfig) return res.status(400).json({ success: false, error: "Missing items or printerConfig" });

        const results = [];

        // Group items by station (kitchenStation ID)
        const itemsByStation = {};
        for (const item of items) {
            const stationId = item.kitchenStation; // This is the ID we passed from frontend
            if (!itemsByStation[stationId]) {
                itemsByStation[stationId] = [];
            }
            itemsByStation[stationId].push(item);
        }

        console.log("Items by station:", Object.keys(itemsByStation));

        // Print for each station found in the items
        for (const [stationId, stationItems] of Object.entries(itemsByStation)) {
            const targetIp = printerConfig[stationId];

            if (targetIp) {
                console.log(`🖨️ Routing station [${stationId}] to IP [${targetIp}]...`);

                try {
                    const isWindowsPrinter = !targetIp.includes('.') && targetIp !== 'localhost';
                    let printerInterface;

                    if (isWindowsPrinter) {
                        printerInterface = await resolveWindowsPrinterPath(targetIp);
                    } else {
                        printerInterface = `tcp://${targetIp}:9100`;
                    }

                    const printer = new ThermalPrinter({
                        type: PrinterTypes.EPSON,
                        interface: printerInterface,
                        characterSet: CharacterSet.PC857_TURKISH,
                        options: { timeout: isWindowsPrinter ? 1000 : 5000 }
                    });

                    if (!isWindowsPrinter) {
                        const isConnected = await printer.isPrinterConnected();
                        if (!isConnected) throw new Error("Printer unreachable");
                    }

                    printer.alignCenter();
                    printer.setTextDoubleHeight();
                    printer.bold(true);
                    printer.add(CMD.CP857);
                    printer.add(encodeText(`MASA ${tableNumber}`));
                    printer.bold(false);
                    printer.setTextNormal();
                    printer.println(new Date().toLocaleString('tr-TR'));
                    printer.println("--------------------------------");
                    printer.alignLeft();

                    for (const item of stationItems) {
                        printer.bold(true);
                        printer.add(CMD.CP857);
                        printer.add(encodeText(`${item.quantity}x ${item.name}\n`));

                        if (item.notes) {
                            printer.bold(false);
                            printer.add(CMD.CP857);
                            printer.add(encodeText(`   NOT: ${item.notes}\n`));
                        }
                    }

                    printer.newLine();
                    printer.println("--------------------------------");
                    printer.cut();

                    await printer.execute();

                    results.push({ stationId, success: true, ip: targetIp });
                    console.log(`✅ Printed successfully to ${stationId} (${printerInterface})`);

                } catch (err) {
                    console.error(`❌ Failed to print to ${stationId} (${targetIp}):`, err);
                    results.push({ stationId, success: false, error: err.message, ip: targetIp });
                }
            } else {
                console.warn(`⚠️ No IP configured for station [${stationId}] in printerConfig`);
                results.push({ stationId, success: false, error: "No IP configured" });
            }
        }

        res.json({ success: true, results });
    } catch (e) {
        console.error("Debug endpoint error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});


// Debug specific path (for granular testing from frontend)
app.post('/debug/test-specific-path', async (req, res) => {
    const { path: printerPath } = req.body;
    console.log(`Checking specific path: ${printerPath}`);

    try {
        if (printerPath.startsWith('\\\\') || printerPath.startsWith('printer:')) {
            // Windows Share / Local Printer
            // If it starts with printer:, strip it for fs check if possible, or just force try
            const checkPath = printerPath.startsWith('printer:') ? printerPath.replace('printer:', '') : printerPath;

            // Note: 'printer:Name' isn't checking a file path, it relies on system driver. 
            // But UNC paths \\localhost\Share are file paths.

            if (checkPath.startsWith('\\\\')) {
                await fs.promises.access(checkPath, fs.constants.W_OK);
                console.log(`✅ Path accessible: ${printerPath}`);
                return res.json({ success: true, message: "Accessible" });
            } else {
                // For 'printer:Name', we can't easily check without trying to print or using printer driver.
                // We'll assume if it's not UNC, we skip fs check or try a dummy driver check (skipped for now to avoid complexity).
                return res.json({ success: true, message: "Skipped fs check for non-UNC path (assumed valid for driver)" });
            }
        } else if (printerPath.startsWith('tcp://')) {
            // Network Printer
            const parts = printerPath.replace('tcp://', '').split(':');
            const printer = new ThermalPrinter({
                type: PrinterTypes.EPSON,
                interface: printerPath,
                options: { timeout: 2000 }
            });
            const isConnected = await printer.isPrinterConnected();
            if (isConnected) {
                return res.json({ success: true, message: "Connected" });
            } else {
                throw new Error("Not Connected");
            }
        } else {
            return res.status(400).json({ success: false, error: "Unknown path format" });
        }
    } catch (error) {
        console.log(`❌ Path failed: ${printerPath} - ${error.message}`);
        return res.json({ success: false, error: error.message });
    }
});

// 404 Handler for JSON responses
app.use((req, res) => {
    console.log(`🔍 404 - Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        error: "Route not found. Please restart the bridge if you just updated it.",
        path: req.path,
        method: req.method
    });
});

app.listen(PORT, () => {
    console.log(`
🚀 LOCAL PRINTER BRIDGE RUNNING!
--------------------------------
Port: ${PORT}
Status: Listening for print commands...

Keep this window OPEN to allow printing.
    `);
});
