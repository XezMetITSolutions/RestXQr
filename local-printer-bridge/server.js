const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');

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

        printer.alignCenter();
        printer.println("RestXQR Local Bridge");
        printer.newLine();

        // Simple text test
        printer.alignLeft();
        printer.println("TEST PRINT SUCCESSFUL");
        printer.println("--------------------------------");
        printer.println("IP: " + ip);
        printer.println("Date: " + new Date().toLocaleDateString());
        printer.println("Time: " + new Date().toLocaleTimeString());
        printer.println("--------------------------------");

        // Character set test
        printer.println("Turkish Char Test:");
        printer.println(encodeText("ÇğıÖşü İIĞÜŞÇ"));
        printer.newLine();

        printer.alignCenter();
        printer.println("End of Test");
        printer.newLine();
        printer.newLine();

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
