/**
 * Utility to render a commercial receipt to a canvas for high-quality thermal printing.
 * Supports Turkish and Chinese characters by using the browser's native rendering.
 */

export interface ReceiptItem {
    name: string;
    quantity: number;
    notes?: string;
    translations?: {
        [lang: string]: {
            name?: string;
            description?: string;
        }
    };
}

export interface ReceiptData {
    orderNumber: string;
    tableNumber: string;
    items: ReceiptItem[];
    type?: string; // e.g., 'KITCHEN' or 'BILL'
}

export const renderReceiptToCanvas = (data: ReceiptData): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = 384; // Standard 58mm printer width (80mm would be ~576px)
    // We'll estimate height and resize later or use a large enough initial height
    canvas.width = width;
    canvas.height = 2000;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error("Could not get canvas context");

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';

    let y = 20;

    // Header: Table Number
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`MASA ${data.tableNumber}`, width / 2, y);
    y += 55;

    // Order Info
    ctx.font = '22px sans-serif';
    ctx.fillText(`#${data.orderNumber}`, width / 2, y);
    y += 30;
    ctx.fillText(new Date().toLocaleString('tr-TR'), width / 2, y);
    y += 40;

    // Separator
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(10, y);
    ctx.lineTo(width - 10, y);
    ctx.stroke();
    y += 20;

    // Items
    ctx.textAlign = 'left';
    data.items.forEach((item) => {
        // Quantity and Main Name (Turkish)
        ctx.font = 'bold 30px sans-serif';
        const mainLine = `${item.quantity}x ${item.name}`;

        // Wrap text if too long
        const words = mainLine.split(' ');
        let line = '';
        const maxWidth = width - 40;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, 20, y);
                line = words[n] + ' ';
                y += 35;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 20, y);
        y += 35;

        // Chinese Name (if available in translations or concatenated)
        const chineseName = item.translations?.zh?.name;
        if (chineseName) {
            ctx.font = '26px "Microsoft YaHei", "PingFang SC", sans-serif';
            ctx.fillText(`   ${chineseName}`, 20, y);
            y += 35;
        }

        // Notes
        if (item.notes) {
            ctx.font = 'italic 24px sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(`   NOT: ${item.notes}`, 20, y);
            ctx.fillStyle = 'black';
            y += 35;
        }

        y += 15; // Padding between items

        // Horizontal line between items
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#eee';
        ctx.moveTo(20, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
        ctx.strokeStyle = 'black';
        y += 15;
    });

    // Footer
    y += 20;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("RestXQr Sistemi", width / 2, y);
    y += 60; // Extra space for cutting

    // Create final cropped canvas
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = y;
    const finalCtx = finalCanvas.getContext('2d');
    if (finalCtx) {
        finalCtx.drawImage(canvas, 0, 0);
    }

    return finalCanvas;
};

export const printReceiptViaBridge = async (bridgeUrl: string, ip: string, data: ReceiptData): Promise<boolean> => {
    try {
        const canvas = renderReceiptToCanvas(data);
        const base64Image = canvas.toDataURL('image/png');

        const response = await fetch(`${bridgeUrl}/print-image/${ip}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error("Bridge print error:", error);
        return false;
    }
};
