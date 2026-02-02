/**
 * Utility to render a commercial receipt to a canvas for high-quality thermal printing.
 * Supports Turkish and Chinese characters by using the browser's native rendering.
 */

export interface ReceiptItem {
    name: string;
    quantity: number;
    price?: number;
    notes?: string;
    translations?: {
        [lang: string]: {
            name?: string;
            description?: string;
        }
    };
    variations?: any[];
}

export interface ReceiptData {
    orderNumber: string;
    tableNumber: string;
    checkNumber?: string; // e.g., "50"
    staffName?: string; // e.g., "Sukru"
    logo?: string; // Data URL or URL
    items: ReceiptItem[];
    type?: string; // e.g., 'KITCHEN' or 'BILL'
    header?: string;
    footer?: string;
    subtotal?: number;
    total?: number;
    showPrices?: boolean;
    taxDetails?: {
        name: string;
        rate: number;
        amount: number;
        net: number;
    };
}

export const renderReceiptToCanvas = async (data: ReceiptData): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    // 576px is standard for 80mm thermal printers
    const width = 576;
    canvas.width = width;
    canvas.height = 3000;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error("Could not get canvas context");

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';

    let y = 10;

    const drawDashedLine = (yCoord: number) => {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.moveTo(10, yCoord);
        ctx.lineTo(width - 10, yCoord);
        ctx.stroke();
        ctx.setLineDash([]);
    };

    // 1. Logo (Large & Centered)
    if (data.logo) {
        try {
            const img = new Image();
            img.src = data.logo;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if logo fails
            });
            if (img.complete && img.width > 0) {
                const logoSize = 160;
                ctx.drawImage(img, (width - logoSize) / 2, y, logoSize, logoSize);
                y += logoSize + 15;
            }
        } catch (e) {
            console.error("Logo drawing error", e);
        }
    }

    // 2. Restaurant Name
    if (data.header) {
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.header.toUpperCase(), width / 2, y);
        y += 38;
    }

    // Separator
    drawDashedLine(y);
    y += 15;

    // 3. Check & Table (Large Bold)
    if (data.type === 'BILL') {
        ctx.textAlign = 'left';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`Cek : ${data.checkNumber || data.orderNumber.slice(-3)}`, 15, y);
        y += 34;
        ctx.fillText(`Masa : MASA - ${data.tableNumber}`, 15, y);
        y += 44;

        // 4. Info Grid
        ctx.font = '20px sans-serif';
        const drawGridRow = (left: string, right: string) => {
            ctx.textAlign = 'left';
            ctx.fillText(left, 15, y);
            ctx.textAlign = 'right';
            ctx.fillText(right, width - 15, y);
            y += 28;
        };

        const now = new Date();
        drawGridRow("Tarih", `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`);
        drawGridRow("Kullanici", data.staffName || "Sukru");
        drawGridRow("Gelir Merkezi", "Restoran");
        y += 10;

        drawDashedLine(y);
        y += 25;
    } else {
        // Kitchen basic header
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`MASA ${data.tableNumber}`, width / 2, y);
        y += 50;

        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(new Date().toLocaleString('tr-TR'), width / 2, y);
        y += 38;
        drawDashedLine(y);
        y += 28;
    }

    const wrapText = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number): number => {
        const chars = Array.from(text);
        let line = '';
        let currentY = startY;

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const nextLine = line + char;
            const width = ctx.measureText(nextLine).width;

            if (width > maxWidth) {
                // If it's a space at the start of a new line, skip it
                if (char === ' ' && line === '') continue;

                // Try to find the last space in 'line' to wrap at word boundary
                const lastSpaceIndex = line.lastIndexOf(' ');
                // Only wrap at space if it's not the only way (avoid infinite loop if word > maxWidth)
                if (lastSpaceIndex > 0) {
                    const wrapLine = line.substring(0, lastSpaceIndex);
                    ctx.fillText(wrapLine.trim(), x, currentY);
                    line = line.substring(lastSpaceIndex + 1) + char;
                    currentY += lineHeight;
                } else {
                    // No suitable space found, wrap at character
                    ctx.fillText(line.trim(), x, currentY);
                    line = char;
                    currentY += lineHeight;
                }
            } else {
                line = nextLine;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
        return currentY + lineHeight;
    };

    // 5. Items
    ctx.textAlign = 'left';
    data.items.forEach((item) => {
        ctx.font = 'bold 28px sans-serif';
        const qtyText = `${item.quantity} x `;
        const nameText = item.name;

        // Draw QTY
        ctx.fillText(qtyText, 15, y);
        const qtyWidth = ctx.measureText(qtyText).width;

        // Wrap Item Name
        const nameMaxWidth = data.type === 'BILL' && item.price !== undefined ? width - 15 - 120 - (15 + qtyWidth) : width - 15 - (15 + qtyWidth);
        const nextY = wrapText(nameText, 15 + qtyWidth, y, nameMaxWidth, 34);

        if (data.type === 'BILL' && item.price !== undefined) {
            ctx.textAlign = 'right';
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText(`${(item.price * item.quantity).toFixed(2)} TL`, width - 15, y);
            ctx.textAlign = 'left';
        }

        y = nextY;

        // Chinese Translation Support
        const chineseName = item.translations?.zh?.name;
        if (chineseName && chineseName !== nameText) {
            ctx.font = '22px sans-serif'; // Slightly smaller for Chinese
            y = wrapText(`   ${chineseName}`, 15, y, width - 30, 28);
        }

        // Variation Rendering (New)
        const variations = (item as any).variations || (item as any).selectedVariation || [];
        const varList = Array.isArray(variations) ? variations : [variations];

        if (varList.length > 0) {
            ctx.font = '24px sans-serif';
            ctx.fillStyle = '#333'; // Slightly gray/lighter bold for variation
            const varText = `   * ${varList.map(v => typeof v === 'string' ? v : (v.name || v.value)).join(', ')} *`;
            y = wrapText(varText, 15, y, width - 30, 30);
            ctx.fillStyle = 'black'; // Reset
        }

        const itemNote = item.notes || (item as any).note;
        if (itemNote) {
            // "Not kalın harflerle olsun altı çizgili olsun"
            ctx.font = 'bold 24px sans-serif';
            const noteText = `   NOT: ${itemNote}`;

            // Draw text and get next y
            const noteYBefore = y;
            y = wrapText(noteText, 15, y, width - 30, 30);

            // Draw underline for the note
            const textWidth = Math.min(ctx.measureText(noteText).width, width - 30);
            ctx.beginPath();
            ctx.moveTo(15, y - 4); // Position underline just below the last line of the note
            ctx.lineTo(15 + textWidth, y - 4);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        y += 15;
    });

    // 6. Summary Section
    if (data.type === 'BILL') {
        y += 24;
        // Ara Toplam
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText("ARA TOPLAM", 15, y);
        ctx.textAlign = 'right';
        ctx.fillText(`${(data.subtotal || data.total || 0).toFixed(2)} TL`, width - 15, y);
        y += 30;

        drawDashedLine(y);
        y += 24;

        // Tax Breakdown
        if (data.taxDetails) {
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${data.taxDetails.name} (${data.taxDetails.rate}%)`, 15, y);
            y += 26;

            ctx.fillText(`${(data.subtotal || data.total || 0).toFixed(2)} TL`, 15, y);
            ctx.textAlign = 'right';
            ctx.fillText(`${data.taxDetails.amount.toFixed(2)} KDV ${data.taxDetails.net.toFixed(2)} NET`, width - 15, y);
            y += 30;
        }

        // Toplam
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText("TOPLAM", 15, y);
        ctx.textAlign = 'right';
        ctx.fillText(`${(data.total || 0).toFixed(2)} TL`, width - 15, y);
        y += 40;

        drawDashedLine(y);
    }

    // Footer
    if (data.footer) {
        y += 35;
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        const lines = data.footer.split('\n');
        lines.forEach(line => {
            ctx.fillText(line, width / 2, y);
            y += 24;
        });
    }

    y += 40;
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
        const canvas = await renderReceiptToCanvas(data);
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
