require('dotenv').config({ path: './backend/.env' });
const { Restaurant } = require('./backend/src/models');

async function updateKrorenStations() {
    try {
        const restaurant = await Restaurant.findOne({ where: { username: 'kroren' } });
        if (!restaurant) {
            console.error('Restaurant kroren not found');
            return;
        }

        let stations = restaurant.kitchenStations || [];

        // Check if Kasa already exists
        if (!stations.find(s => s.id === 'kasa')) {
            stations.push({
                id: 'kasa',
                name: 'Kasa',
                emoji: '💰',
                color: '#10b981',
                order: stations.length + 1
            });

            await restaurant.update({ kitchenStations: stations });
            console.log('✅ Kasa station added to Kroren');
        } else {
            console.log('ℹ️ Kasa station already exists for Kroren');
        }

        // Also ensure printerConfig has an entry (optional but helpful)
        let printerConfig = restaurant.printerConfig || {};
        if (!printerConfig['kasa']) {
            printerConfig['kasa'] = {
                ip: '',
                port: 9100,
                enabled: true
            };
            await restaurant.update({ printerConfig });
            console.log('✅ Kasa entry added to printerConfig');
        }

    } catch (error) {
        console.error('Error updating restaurant stations:', error);
    } finally {
        process.exit();
    }
}

updateKrorenStations();
