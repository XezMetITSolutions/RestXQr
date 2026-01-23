const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

async function getCats() {
    try {
        const res = await fetch(API_BASE + '/restaurants/' + KROREN_RESTAURANT_ID + '/menu/categories');
        const data = await res.json();
        data.data.forEach(c => console.log(`${c.id}: ${c.name}`));
    } catch (error) {
        console.error(error);
    }
}

getCats();
