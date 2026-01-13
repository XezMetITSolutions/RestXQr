const { Order, Restaurant, OrderItem } = require('./src/models');
const { sequelize } = require('./src/models');

async function debugOrders() {
    try {
        await sequelize.authenticate();
        console.log('📡 DB Connection established.');

        const kroren = await Restaurant.findOne({
            where: { username: 'kroren' }
        });

        if (!kroren) {
            console.log('❌ Kroren restaurant not found in DB');
            return;
        }

        console.log('✅ Found Kroren Restaurant:', kroren.id);

        const orders = await Order.findAll({
            where: { restaurantId: kroren.id }
        });

        console.log(`📊 Found ${orders.length} orders for Kroren.`);

        if (orders.length > 0) {
            orders.forEach(o => {
                console.log(`- Order ID: ${o.id}, Status: ${o.status}, Table: ${o.tableNumber}, Total: ${o.totalAmount}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugOrders();
