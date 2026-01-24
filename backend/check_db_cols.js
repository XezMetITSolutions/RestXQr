const { sequelize } = require('./src/models');

async function checkColumns() {
    try {
        const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'menu_items'");
        console.log('Columns in menu_items:');
        results.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type})`);
        });

        const [catResults] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'menu_categories'");
        console.log('\nColumns in menu_categories:');
        catResults.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type})`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkColumns();
