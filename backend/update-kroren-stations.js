// Update Kroren restaurant kitchen stations
const { Restaurant } = require('./src/models');

async function updateKitchenStations() {
    try {
        console.log('🔍 Finding Kroren restaurant...');

        const kroren = await Restaurant.findOne({
            where: { username: 'kroren' }
        });

        if (!kroren) {
            console.error('❌ Kroren restaurant not found!');
            process.exit(1);
        }

        console.log('✅ Found Kroren restaurant');
        console.log('Current kitchen stations:', kroren.kitchenStations);

        // Update with new stations
        const newStations = [
            {
                id: 'kavurma',
                name: 'Kavurma',
                emoji: '🍖',
                color: '#EF4444',
                order: 1
            },
            {
                id: 'ramen',
                name: 'Ramen',
                emoji: '🍜',
                color: '#F59E0B',
                order: 2
            },
            {
                id: 'manti',
                name: 'Mantı',
                emoji: '🥟',
                color: '#3B82F6',
                order: 3
            }
        ];

        await kroren.update({
            kitchenStations: newStations
        });

        console.log('✅ Kitchen stations updated successfully!');
        console.log('New stations:', newStations);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

updateKitchenStations();
