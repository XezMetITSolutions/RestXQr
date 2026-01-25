const { sequelize, Restaurant } = require('./src/models');

async function testFetch() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Fetching restaurant by username "kroren"...');
        const restaurant = await Restaurant.findOne({
            where: { username: 'kroren' }
        });

        if (restaurant) {
            console.log('✅ Found restaurant:', restaurant.name);
        } else {
            console.log('❌ Restaurant not found');
        }

    } catch (error) {
        console.error('❌ Error fetching restaurant:', error);
        if (error.original) {
            console.error('Original SQL Error:', error.original);
        }
    } finally {
        await sequelize.close();
    }
}

testFetch();
