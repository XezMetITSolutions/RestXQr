const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

const updateData = [
    { name: 'Dana noodle', group: 'Makarnalar & Noodle', price: 338, station: 'KAVURMA' },
    { name: 'Buharda mantı - 4 adet', group: 'Başlangıç', price: 328, station: 'KEBAP' },
    { name: 'Haşlanmış mantı', group: 'Başlangıç', price: 358, station: 'KEBAP' },
    { name: 'Dana etli ramen 1', group: 'Makarnalar & Noodle', price: 218, station: 'RAMEN' },
    { name: 'Guyro', group: 'Dana Yemekleri', price: 528, station: 'KAVURMA' },
    { name: 'Acılı lokum tavuk', group: 'Tavuk Yemekleri', price: 388, station: 'KAVURMA' },
    { name: 'Patates kavurması', group: 'Sebze & Tofu Yemekleri', price: 258, station: 'KAVURMA' },
    { name: 'Tatlı ekşi tavuk', group: 'Tavuk Yemekleri', price: 388, station: 'KAVURMA' },
    { name: 'Balık sushi', group: 'Sushi', price: 338, station: 'KEBAP' },
    { name: 'Portakallı tavuk', group: 'Tavuk Yemekleri', price: 298, station: 'KAVURMA' },
    { name: 'Karides krakerleri', group: 'Yan Ürünler & Atıştırmalıklar', price: 48, station: 'KAVURMA' },
    { name: 'Dana etli sushi', group: 'Sushi', price: 338, station: 'KEBAP' },
    { name: '50 gram dana eti', group: 'Ek Ücretler', price: 198, station: 'RAMEN' },
    { name: 'Uygur mantı', group: 'Başlangıç', price: 358, station: 'KEBAP' },
    { name: 'Dana etli ramen', group: 'Beğenilenler', price: 218, station: 'RAMEN' },
    { name: 'Dana etli rojamo', group: 'Başlangıç', price: 278, station: 'KEBAP' },
    { name: 'Pırasalı dana', group: 'Dana Yemekleri', price: 528, station: 'KAVURMA' },
    { name: 'Erişte salatası', group: 'Salatalar', price: 158, station: 'KEBAP' },
    { name: 'Portakallı çıtır tavuk', group: 'Tavuk Yemekleri', price: 288, station: 'KAVURMA' },
    { name: 'Tatlı buharda mantı (2 adet)', group: 'Başlangıç', price: 168, station: 'KEBAP' },
    { name: 'Ganbian makarnası', group: 'Makarnalar & Noodle', price: 328, station: 'KAVURMA' },
    { name: 'Sebze sushi', group: 'Sushi', price: 278, station: 'KEBAP' },
    { name: 'Sebzeli noodle', group: 'Makarnalar & Noodle', price: 268, station: 'KAVURMA' },
    { name: 'Dana etli ramen 1 (Küçük)', group: 'Makarnalar & Noodle', price: 198, station: 'RAMEN' },
    { name: 'Dana etli ramen (Küçük)', group: 'Beğenilenler', price: 198, station: 'RAMEN' },
    { name: 'Çin böreği', group: 'Başlangıç', price: 228, station: 'KAVURMA' },
    { name: 'Hoxan 4 adet', group: 'Başlangıç', price: 328, station: 'KEBAP' },
    { name: 'Manzhou usulü tavuk', group: 'Tavuk Yemekleri', price: 388, station: 'KAVURMA' },
    { name: 'Kızarmış dana döş', group: 'Dana Yemekleri', price: 268, station: 'RAMEN' },
    { name: 'Acılı haşlanmış dana', group: 'Dana Yemekleri', price: 1028, station: 'KAVURMA' },
    { name: 'Tavuk noodle', group: 'Makarnalar & Noodle', price: 298, station: 'KAVURMA' },
    { name: 'Beyaz pilav', group: 'Yan Ürünler & Atıştırmalıklar', price: 108, station: 'KEBAP' },
    { name: 'Sade ekmek', group: 'Yan Ürünler & Atıştırmalıklar', price: 38, station: 'KEBAP' },
    { name: 'Buharda mantı - 2 adet', group: 'Başlangıç', price: 168, station: 'KEBAP' },
    { name: 'Guyro lagmen', group: 'Makarnalar & Noodle', price: 388, station: 'KAVURMA' },
    { name: 'Çay yumurtası', group: 'Başlangıç', price: 38, station: 'KEBAP' },
    { name: 'Sığır eti salatası', group: 'Salatalar', price: 658, station: 'KEBAP' },
    { name: 'Hoxan 2 adet', group: 'Başlangıç', price: 168, station: 'KEBAP' },
    { name: 'Dapanji', group: 'Tavuk Yemekleri', price: 558, station: 'KAVURMA' }
];

async function run() {
    try {
        // 1. Get current categories
        const catRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`);
        const catData = await catRes.json();
        const catMap = {};
        catData.data.forEach(c => { catMap[c.name] = c.id; });

        // Create 'Başlangıç' if it doesn't exist
        if (!catMap['Başlangıç']) {
            const newCatRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Başlangıç', displayOrder: 0 })
            });
            const newCat = await newCatRes.json();
            catMap['Başlangıç'] = newCat.data.id;
        }

        // 2. Get current items
        const prodRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`);
        const prodData = await prodRes.json();
        const existingProds = prodData.data;

        for (const p of updateData) {
            // Find matching product
            let match = existingProds.find(ep => ep.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(ep.name.toLowerCase()));

            const payload = {
                name: p.name,
                price: p.price,
                categoryId: catMap[p.group] || catMap['Ana Yemekler / Diğer'],
                kitchenStation: p.station,
                isAvailable: true
            };

            if (match) {
                console.log(`Updating product: ${match.name} -> ${p.name} (Price: ${p.price}, Station: ${p.station})`);
                await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items/${match.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                console.log(`Adding missing product: ${p.name} (Price: ${p.price}, Station: ${p.station})`);
                await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            await new Promise(r => setTimeout(r, 50));
        }
        console.log('Update complete!');
    } catch (error) {
        console.error(error);
    }
}

run();
