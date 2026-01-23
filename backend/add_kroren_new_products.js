const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

const newProducts = [
    // Makarnalar & Noodle
    { name: 'Dana döş ramen', price: 328, catName: 'Makarnalar & Noodle' },
    { name: 'Dana noodle', price: 368, catName: 'Makarnalar & Noodle' },

    // Ana Yemekler / Diğer
    { name: 'Hoxan 4lü', price: 398, catName: 'Ana Yemekler / Diğer' },
    { name: 'Uygur mantı', price: 398, catName: 'Ana Yemekler / Diğer' },

    // Dana Yemekleri (Yeni Kategori veya Ana Yemek)
    { name: 'Özel soslu dana', price: 728, catName: 'Dana Yemekleri' },
    { name: 'Guyro', price: 728, catName: 'Dana Yemekleri' },
    { name: 'Pırasalı dana', price: 728, catName: 'Dana Yemekleri' },

    // Sebze & Tofu Yemekleri (Yeni Kategori veya Ana Yemek)
    { name: 'Özel soslu tofu', price: 388, catName: 'Sebze & Tofu Yemekleri' },
    { name: 'Kızartma tofu', price: 388, catName: 'Sebze & Tofu Yemekleri' },
    { name: 'Acılı tofu', price: 398, catName: 'Sebze & Tofu Yemekleri' },
    { name: 'Patates kavurması', price: 258, catName: 'Sebze & Tofu Yemekleri' },

    // Sushi
    { name: 'Sebze sushi', price: 278, catName: 'Sushi' },

    // Yan Ürünler & Atıştırmalıklar
    { name: 'Pirinç keki', price: 158, catName: 'Yan Ürünler & Atıştırmalıklar' },
    { name: 'Beyaz pilav', price: 128, catName: 'Yan Ürünler & Atıştırmalıklar' },

    // İçecekler
    { name: 'Coca cola', price: 68, catName: 'İçecekler' },
    { name: 'Su', price: 30, catName: 'İçecekler' },
    { name: 'Coca cola zero', price: 68, catName: 'İçecekler' },
    { name: 'Ice tea şeftali', price: 68, catName: 'İçecekler' },
    { name: 'Ice tea mango', price: 68, catName: 'İçecekler' },
    { name: 'Sprite', price: 68, catName: 'İçecekler' },
    { name: 'Ice tea lemon', price: 68, catName: 'İçecekler' },
    { name: 'Limonlu soda', price: 40, catName: 'İçecekler' },
    { name: 'Fanta', price: 68, catName: 'İçecekler' },
    { name: 'Elmalı soda', price: 40, catName: 'İçecekler' },

    // Ek Ücretler
    { name: '50 gram dana eti', price: 198, catName: 'Ek Ücretler' }
];

async function run() {
    try {
        // 1. Get existing categories
        const catRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`);
        const catData = await catRes.json();
        const existingCats = catData.data;

        const catMap = {};
        existingCats.forEach(c => {
            catMap[c.name] = c.id;
        });

        console.log('Existing categories:', Object.keys(catMap));

        for (const p of newProducts) {
            let catId = catMap[p.catName];

            // 2. Create category if it doesn't exist
            if (!catId) {
                console.log(`Creating category: ${p.catName}`);
                const newCatRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: p.catName, displayOrder: 10 })
                });
                const newCatData = await newCatRes.json();
                catId = newCatData.data.id;
                catMap[p.catName] = catId;
                console.log(`Created category ${p.catName} with ID ${catId}`);
            }

            // 3. Add product
            console.log(`Adding product: ${p.name}`);
            const prodRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: p.name,
                    price: p.price,
                    categoryId: catId,
                    isAvailable: true
                })
            });

            if (prodRes.ok) {
                console.log(`✅ Success: ${p.name}`);
            } else {
                const err = await prodRes.text();
                console.error(`❌ Failed: ${p.name} - ${err}`);
            }

            // Wait a bit
            await new Promise(r => setTimeout(r, 100));
        }

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
