const { Restaurant, MenuCategory, MenuItem } = require('./src/models');

async function testFetch() {
    try {
        const restaurantId = '37b0322a-e11f-4ef1-b108-83be310aaf4d';
        console.log(`Testing menu fetch for restaurant: ${restaurantId}`);

        // Verify restaurant exists
        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            console.log('Restaurant not found');
            return;
        }
        console.log('Restaurant found:', restaurant.name);

        // Get all categories with their items
        console.log('Fetching categories with items...');
        const categories = await MenuCategory.findAll({
            where: { restaurantId },
            include: [
                {
                    model: MenuItem,
                    as: 'items',
                    required: false
                }
            ],
            order: [
                ['displayOrder', 'ASC'],
                [{ model: MenuItem, as: 'items' }, 'displayOrder', 'ASC']
            ]
        });
        console.log(`Fetched ${categories.length} categories.`);

        // Get all items separately
        console.log('Fetching items separately...');
        const items = await MenuItem.findAll({
            include: [
                {
                    model: MenuCategory,
                    as: 'category',
                    where: { restaurantId },
                    attributes: ['id', 'name']
                }
            ],
            order: [['displayOrder', 'ASC']]
        });
        console.log(`Fetched ${items.length} items.`);

    } catch (error) {
        console.error('FATAL ERROR CAUGHT:', error);
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.original) {
            console.error('Original SQL Error:', error.original);
        }
    }
}

testFetch();
