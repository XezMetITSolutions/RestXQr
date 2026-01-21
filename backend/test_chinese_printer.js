/**
 * Çince Yazıcı Test Scripti
 * 
 * Bu script ile yazıcınızın Çince karakter desteğini test edebilirsiniz.
 * 
 * Kullanım:
 * node test_chinese_printer.js
 */

const printerService = require('./src/services/printerService');

async function testChinesePrinter() {
    console.log('🧪 Çince Yazıcı Testi Başlatılıyor...\n');

    // Test istasyonu ekle
    printerService.addOrUpdateStation('test-kitchen', {
        name: '测试厨房', // Test Mutfak
        ip: '192.168.1.100', // BURAYA YAZICININ IP ADRESİNİ GİRİN
        port: 9100,
        enabled: true,
        type: 'epson',
        language: 'zh',
        characterSet: 'PC936_CHINESE',
        codePage: 'GB18030'
    });

    console.log('✅ Test istasyonu oluşturuldu');
    console.log('📍 IP: 192.168.1.100');
    console.log('🌐 Dil: Çince (中文)\n');

    // Test siparişi
    const testOrder = {
        orderNumber: 'TEST-' + Date.now(),
        tableNumber: '5号桌', // Masa 5
        items: [
            {
                quantity: 2,
                name: 'Adana Kebap',
                notes: '不要辣椒' // Acısız
            },
            {
                quantity: 1,
                name: 'Türk Kahvesi',
                notes: '加糖' // Şekerli
            },
            {
                quantity: 3,
                name: 'Baklava',
                notes: '打包' // Paket
            }
        ]
    };

    console.log('📝 Test Siparişi:');
    console.log(JSON.stringify(testOrder, null, 2));
    console.log('\n🖨️ Yazdırılıyor...\n');

    // Yazdır
    try {
        const result = await printerService.printOrderAdvanced('test-kitchen', testOrder);

        if (result.success) {
            console.log('✅ BAŞARILI! Yazıcıdan Çince fiş çıktı.');
            console.log('\n📋 Beklenen Çıktı:');
            console.log('═══════════════════════════════════');
            console.log('         测试厨房');
            console.log('═══════════════════════════════════');
            console.log('');
            console.log(`订单号: ${testOrder.orderNumber}`);
            console.log(`桌号: ${testOrder.tableNumber}`);
            console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);
            console.log('───────────────────────────────────');
            console.log('');
            console.log('产品:');
            console.log('');
            console.log('2x 阿达纳烤肉串');
            console.log('   备注: 不要辣椒');
            console.log('');
            console.log('1x 土耳其咖啡');
            console.log('   备注: 加糖');
            console.log('');
            console.log('3x 果仁蜜饼');
            console.log('   备注: 打包');
            console.log('');
            console.log('───────────────────────────────────');
            console.log('');
            console.log('        请享用!');
            console.log('');
            console.log('═══════════════════════════════════');
        } else {
            console.error('❌ HATA:', result.error);
            console.log('\n🔧 Kontrol Listesi:');
            console.log('1. Yazıcının IP adresi doğru mu?');
            console.log('2. Yazıcı açık ve ağa bağlı mı?');
            console.log('3. Port 9100 açık mı?');
            console.log('4. Yazıcı GB18030 destekliyor mu?');
        }
    } catch (error) {
        console.error('❌ Test Hatası:', error.message);
    }
}

// Test'i çalıştır
testChinesePrinter().then(() => {
    console.log('\n✅ Test tamamlandı');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test başarısız:', error);
    process.exit(1);
});
