const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

async function dump() {
    try {
        const catRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`);
        const catData = await catRes.json();
        const itemsRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`);
        const itemsData = await itemsRes.json();
        console.log(JSON.stringify({
            categories: catData.data.map(c => ({ id: c.id, name: c.name })),
            items: itemsData.data.map(i => ({ id: i.id, name: i.name, categoryId: i.categoryId, price: i.price }))
        }, null, 2));
    } catch (error) {
        console.error(error);
    }
}

dump();
