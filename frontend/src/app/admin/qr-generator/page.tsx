'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaDownload, FaPrint } from 'react-icons/fa';
import QRCode from 'qrcode.react';

export default function QRGeneratorPage() {
  const [tableNumber, setTableNumber] = useState('1');
  const [restaurantId, setRestaurantId] = useState('demo123');
  const [size, setSize] = useState(200);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#000000');
  const [includeLogoText, setIncludeLogoText] = useState(true);
  const [language, setLanguage] = useState<'en' | 'tr'>('en');

  const translations = {
    en: {
      qrGenerator: 'QR Code Generator',
      tableNumber: 'Table Number',
      restaurantId: 'Restaurant ID',
      size: 'QR Code Size',
      bgColor: 'Background Color',
      fgColor: 'Foreground Color',
      includeLogo: 'Include Logo Text',
      generate: 'Generate QR Code',
      download: 'Download QR Code',
      print: 'Print QR Code',
      back: 'Back to Dashboard',
      tableQrCode: 'Table QR Code',
      scanToOrder: 'Scan to view menu and order',
    },
    tr: {
      qrGenerator: 'QR Kod Oluşturucu',
      tableNumber: 'Masa Numarası',
      restaurantId: 'Restoran ID',
      size: 'QR Kod Boyutu',
      bgColor: 'Arka Plan Rengi',
      fgColor: 'Ön Plan Rengi',
      includeLogo: 'Logo Metni Ekle',
      generate: 'QR Kod Oluştur',
      download: 'QR Kodu İndir',
      print: 'QR Kodu Yazdır',
      back: 'Panele Dön',
      tableQrCode: 'Masa QR Kodu',
      scanToOrder: 'Menüyü görmek ve sipariş vermek için tarayın',
    }
  };

  const t = translations[language];

  const qrValue = `https://masapp.com/menu/${restaurantId}?table=${tableNumber}`;

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `masapp-qr-table-${tableNumber}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
      const imageUrl = canvas.toDataURL('image/png');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>MASAPP QR Code - Table ${tableNumber}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .qr-container {
                margin: 0 auto;
                max-width: 300px;
              }
              .restaurant-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .table-number {
                font-size: 36px;
                font-weight: bold;
                margin: 20px 0;
              }
              .instructions {
                font-size: 14px;
                color: #666;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="restaurant-name">MASAPP</div>
              <div class="table-number">Table ${tableNumber}</div>
              <img src="${imageUrl}" alt="QR Code" style="width: 100%;" />
              <div class="instructions">${t.scanToOrder}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin" className="mr-2">
              <FaArrowLeft />
            </Link>
            <h1 className="text-xl font-bold text-secondary">{t.qrGenerator}</h1>
          </div>
          <div className="flex items-center ml-4">
            <button 
              onClick={() => setLanguage('en')}
              className={`mr-2 px-3 py-1 rounded ${language === 'en' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('tr')}
              className={`px-3 py-1 rounded ${language === 'tr' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              TR
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Code Generator Form */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">{t.qrGenerator}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.tableNumber}</label>
                <input
                  type="number"
                  className="input w-full"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{t.restaurantId}</label>
                <input
                  type="text"
                  className="input w-full"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{t.size}</label>
                <input
                  type="range"
                  className="w-full"
                  min="100"
                  max="400"
                  step="10"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                />
                <div className="text-right text-sm text-gray-500">{size}px</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.bgColor}</label>
                  <input
                    type="color"
                    className="w-full h-10 p-0 border-0"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t.fgColor}</label>
                  <input
                    type="color"
                    className="w-full h-10 p-0 border-0"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-logo"
                  className="mr-2"
                  checked={includeLogoText}
                  onChange={(e) => setIncludeLogoText(e.target.checked)}
                />
                <label htmlFor="include-logo">{t.includeLogo}</label>
              </div>
            </div>
          </div>
          
          {/* QR Code Preview */}
          <div className="card flex flex-col items-center">
            <h2 className="text-xl font-bold mb-6">{t.tableQrCode} #{tableNumber}</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 text-center">
              {includeLogoText && (
                <div className="mb-4">
                  <div className="text-xl font-bold">MASAPP</div>
                  <div className="text-2xl font-bold mt-2">Table {tableNumber}</div>
                </div>
              )}
              
              <QRCode
                id="qr-code"
                value={qrValue}
                size={size}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={true}
              />
              
              <div className="mt-4 text-sm text-gray-500">
                {t.scanToOrder}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={downloadQRCode}
              >
                <FaDownload />
                {t.download}
              </button>
              
              <button
                className="btn btn-outline flex items-center gap-2"
                onClick={printQRCode}
              >
                <FaPrint />
                {t.print}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
