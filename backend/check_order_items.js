require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkOrderItemsTable() {
    try {
        console.log('--- Checking order_items table ---');
        const [tableCheck] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items')");
        const tableExists = tableCheck[0].exists;
        console.log(`Table 'order_items' exists: ${tableExists}`);

        if (tableExists) {
            const [results] = await sequelize.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'order_items'");
            console.log('\nColumns in order_items:');
            results.forEach(col => {
                console.log(`- ${col.column_name} (${col.data_type}) [Null: ${col.is_nullable}]`);
            });
        } else {
            console.log('Table order_items does NOT exist.');
        }

        process.exit(0);
    } catch (e) {
        console.error('Error checking table:', e);
        process.exit(1);
    }
}

checkOrderItemsTable();
