const fs = require('fs');

const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

async function fetchMenu() {
    console.log('Fetching categories...');
    const catRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`);
    const categories = await catRes.json();

    console.log('Fetching items...');
    const itemRes = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`);
    const items = await itemRes.json();

    const data = {
        categories: categories.data || [],
        items: items.data || []
    };

    fs.writeFileSync('kroren_current_menu.json', JSON.stringify(data, null, 2));
    console.log(`Saved ${data.categories.length} categories and ${data.items.length} items to kroren_current_menu.json`);
}

fetchMenu().catch(console.error);
