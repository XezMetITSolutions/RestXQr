const express = require('express');
const cors = require('cors');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

const app = express();
const PORT = 3005;

// Enable CORS for the cloud frontend
app.use(cors({
    origin: '*', // Allow all origins for simplicity in local bridge
    methods: ['GET', 'POST']
}));

app.use(express.json());

// Turkish Character Map (CP857)
const turkishCharMap = {
    'ç': '\x87', 'Ç': '\x80',
    'ğ': '\x98', 'Ğ': '\xA6',
    'ı': '\x8D', 'İ': '\x98',
    'ö': '\x94', 'Ö': '\x99',
    'ş': '\x9E', 'Ş': '\x9D',
    'ü': '\x81', 'Ü': '\x9A'
};

function encodeText(text) {
    let converted = text;
    Object.keys(turkishCharMap).forEach(char => {
        converted = converted.replace(new RegExp(char, 'g'), turkishCharMap[char]);
    });
    return converted;
}

// Check status endpoint
app.get('/status/:ip', async (req, res) => {
    const { ip } = req.params;
    console.log(`Checking status for printer at ${ip}...`);

    try {
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
        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: `tcp://${ip}:9100`,
            characterSet: CharacterSet.PC857_TURKISH,
            removeSpecialCharacters: false,
            lineCharacter: '-',
            options: {
                timeout: 5000
            }
        });

        const isConnected = await printer.isPrinterConnected();
        if (!isConnected) {
            throw new Error("Printer not connected");
        }

        // Kitchen Receipt Format
        printer.alignCenter();
        printer.setTextDoubleHeight();
        printer.bold(true);
        printer.println("MASA 15");
        printer.bold(false);
        printer.setTextNormal();
        printer.println(new Date().toLocaleString('tr-TR'));
        printer.drawLine();
        printer.newLine();

        // Products with Turkish/Chinese names and special notes
        printer.alignLeft();

        // Product 1
        printer.bold(true);
        printer.println(encodeText("2x Karışık Ramen"));
        printer.bold(false);
        printer.println("2x 什锦拉面");
        printer.invert(true);
        printer.println(encodeText("  ⚠ Acılı, Soğansız"));
        printer.invert(false);
        printer.drawLine();

        // Product 2
        printer.bold(true);
        printer.println(encodeText("1x Dana Etli Ramen"));
        printer.bold(false);
        printer.println("1x 牛肉拉面");
        printer.invert(true);
        printer.println(encodeText("  ⚠ Çok Acılı"));
        printer.invert(false);
        printer.drawLine();

        // Product 3
        printer.bold(true);
        printer.println(encodeText("3x Mantı"));
        printer.bold(false);
        printer.println("3x 饺子");
        printer.invert(true);
        printer.println(encodeText("  ⚠ Acısız"));
        printer.invert(false);
        printer.drawLine();

        // Product 4
        printer.bold(true);
        printer.println(encodeText("1x Izgara Tavuk"));
        printer.bold(false);
        printer.println("1x 烤鸡");
        printer.println(encodeText("  Not: Az pişmiş"));
        printer.drawLine();

        printer.newLine();
        printer.alignCenter();
        printer.setTextSize(0, 0);
        printer.println("RestXQr - " + ip);

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
    const { orderNumber, tableNumber, items } = req.body;

    console.log(`Received PRINT request for ${ip} (Order: ${orderNumber})`);

    try {
        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: `tcp://${ip}:9100`,
            characterSet: CharacterSet.PC857_TURKISH,
            removeSpecialCharacters: false,
            lineCharacter: '-',
            options: { timeout: 5000 }
        });

        const isConnected = await printer.isPrinterConnected();
        if (!isConnected) throw new Error("Printer unreachable");

        // Format Kitchen Receipt
        printer.alignCenter();
        printer.setTextDoubleHeight();
        printer.bold(true);
        printer.println(encodeText(`MASA ${tableNumber || '?'}`));
        printer.bold(false);
        printer.setTextNormal();
        printer.println(new Date().toLocaleString('tr-TR'));
        printer.println(`Siparis No: ${orderNumber}`);
        printer.drawLine();
        printer.newLine();

        printer.alignLeft();
        for (const item of items) {
            printer.bold(true);
            printer.println(encodeText(`${item.quantity}x ${item.name}`));
            printer.bold(false);
            if (item.notes) {
                printer.println(encodeText(`   NOT: ${item.notes}`));
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

// DEBUG CHARACTERS ENDPOINT
app.post('/debug-chars/:ip', async (req, res) => {
    const { ip } = req.params;
    const { method } = req.body;
    console.log(`Debug request: Method ${method} for ${ip}`);

    try {
        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: `tcp://${ip}:9100`,
            removeSpecialCharacters: false,
            options: { timeout: 5000 }
        });

        const isConnected = await printer.isPrinterConnected();
        if (!isConnected) throw new Error("Printer unreachable");

        printer.alignCenter();
        printer.println(`DEBUG METHOD ${method}`);
        printer.println(`IP: ${ip}`);
        printer.drawLine();
        printer.alignLeft();

        const trText = "Türkçe: ğüşiöç İĞÜŞÖÇ";
        const cnText = "Chinese: 什锦拉面 (Karışık Ramen)";

        if (method === 1) {
            // Method 1: PC857 Turkish Only
            printer.add(Buffer.from([0x1B, 0x74, 13])); // ESC t 13 -> PC857
            printer.add(iconv.encode(trText + "\n", 'cp857'));
            printer.add(iconv.encode(cnText + "\n", 'cp857')); // This will fail for Chinese but good for comparison
        }
        else if (method === 2) {
            // Method 2: GB18030 Chinese Native
            printer.add(Buffer.from([0x1C, 0x26])); // FS & -> Enter Kanji Mode
            printer.add(iconv.encode(cnText + "\n", 'gb18030'));
            printer.add(iconv.encode(trText + "\n", 'gb18030'));
        }
        else if (method === 3) {
            // Method 3: UTF-8 Mode (if supported)
            printer.add(Buffer.from([0x1D, 0x28, 0x47, 0x03, 0x00, 0x30, 0x01, 0x02])); // UTF-8 ON
            printer.add(iconv.encode(trText + "\n", 'utf8'));
            printer.add(iconv.encode(cnText + "\n", 'utf8'));
        }
        else if (method === 4) {
            // Method 4: Individual switching
            // Print Turkish Line
            printer.add(Buffer.from([0x1B, 0x74, 13]));
            printer.add(iconv.encode(trText + "\n", 'cp857'));

            // Print Chinese Line
            printer.add(Buffer.from([0x1C, 0x26]));
            printer.add(iconv.encode(cnText + "\n", 'gb18030'));
        }

        printer.newLine();
        printer.println("Check which line is correct.");
        printer.cut();

        await printer.execute();
        res.json({ success: true, method });

    } catch (error) {
        console.error("Debug print error:", error);
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

        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: `tcp://${ip}:9100`,
            options: { timeout: 10000 }
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

app.listen(PORT, () => {
    console.log(`
🚀 LOCAL PRINTER BRIDGE RUNNING!
--------------------------------
Port: ${PORT}
Status: Listening for print commands...

Keep this window OPEN to allow printing.
    `);
});
