// Console'a yapıştırın ve Enter'a basın

// 1. LocalStorage içeriğini göster
console.log('=== LOCALSTORAGE İÇERİĞİ ===');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`\n${key}:`);
    try {
        console.log(JSON.parse(value));
    } catch (e) {
        console.log(value);
    }
}

// 2. Printer ile ilgili tüm verileri temizle
console.log('\n=== TEMİZLENİYOR ===');
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('printer') || key.includes('station') || key.includes('business-settings')) {
        keysToRemove.push(key);
    }
}

keysToRemove.forEach(key => {
    console.log(`Siliniyor: ${key}`);
    localStorage.removeItem(key);
});

// 3. SessionStorage'ı da temizle
sessionStorage.clear();

console.log('\n✅ Cache temizlendi! Sayfa yenileniyor...');

// 4. Sayfayı yenile
setTimeout(() => {
    window.location.reload(true);
}, 1000);
