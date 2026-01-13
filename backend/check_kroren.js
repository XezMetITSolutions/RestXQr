const { Restaurant, MenuCategory, MenuItem } = require('./src/models');
const { sequelize } = require('./src/models');

async function checkRestaurant() {
    try {
        await sequelize.authenticate();

        const kroren = await Restaurant.findOne({
            where: {
                name: {
                    [require('sequelize').Op.iLike]: '%kroren%'
                }
            }
        });

        if (!kroren) {
            console.log('❌ Kroren restaurant not found');
            return;
        }

        console.log('✅ Found Restaurant:', {
            id: kroren.id,
            name: kroren.name,
            username: kroren.username
        });

        const categories = await MenuCategory.findAll({
            where: { restaurantId: kroren.id }
        });

        console.log('📁 Categories:', categories.map(c => ({ id: c.id, name: c.name })));

        const itemsCount = await MenuItem.count({
            where: { restaurantId: kroren.id }
        });

        console.log('🍕 Total Items:', itemsCount);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkRestaurant();
