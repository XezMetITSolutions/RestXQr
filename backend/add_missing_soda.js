const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

const missingProducts = [
    { name: 'Sade soda', price: 40, catName: 'İçecekler' }
];

async function run() {
    try {
        const catRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`);
        const catData = await catRes.json();
        const existingCats = catData.data;
        const catMap = {};
        existingCats.forEach(c => { catMap[c.name] = c.id; });

        for (const p of missingProducts) {
            let catId = catMap[p.catName];
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
            if (prodRes.ok) console.log(`✅ Success: ${p.name}`);
        }
    } catch (error) {
        console.error(error);
    }
}
run();
