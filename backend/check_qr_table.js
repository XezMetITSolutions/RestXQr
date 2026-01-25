const { sequelize } = require('./src/models');

async function checkQRTable() {
    try {
        console.log('--- Checking qr_tokens table ---');
        const [tableCheck] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'qr_tokens')");
        const tableExists = tableCheck[0].exists;
        console.log(`Table 'qr_tokens' exists: ${tableExists}`);

        if (tableExists) {
            const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'qr_tokens'");
            console.log('\nColumns in qr_tokens:');
            results.forEach(col => {
                console.log(`- ${col.column_name} (${col.data_type})`);
            });
        } else {
            console.log('Table qr_tokens does NOT exist in the database.');
        }

        process.exit(0);
    } catch (e) {
        console.error('Error checking table:', e);
        process.exit(1);
    }
}

checkQRTable();
