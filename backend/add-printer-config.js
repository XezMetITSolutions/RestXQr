const { sequelize } = require('./src/models');

async function addPrinterConfigColumn() {
    try {
        console.log('🔍 Checking if printer_config column exists...');

        const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='restaurants' AND column_name='printer_config';
    `);

        if (results.length > 0) {
            console.log('✅ printer_config column already exists!');
            return;
        }

        console.log('⚙️ Adding printer_config column...');

        await sequelize.query(`
      ALTER TABLE restaurants 
      ADD COLUMN printer_config JSONB DEFAULT '{}'::jsonb;
    `);

        console.log('✅ printer_config column added successfully!');

        // Kroren için kavurma istasyonuna IP ata
        console.log('🔧 Setting Kroren kavurma printer IP to 192.168.1.13...');

        await sequelize.query(`
      UPDATE restaurants 
      SET printer_config = '{"kavurma": {"ip": "192.168.1.13", "port": 9100, "enabled": true}}'::jsonb
      WHERE username = 'kroren';
    `);

        console.log('✅ Kroren printer config updated!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

addPrinterConfigColumn();
