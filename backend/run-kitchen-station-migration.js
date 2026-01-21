const { sequelize } = require('./src/models');

async function runMigration() {
    try {
        console.log('🔍 Checking if kitchen_station column exists...');

        // Check if the column already exists
        const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='menu_items' AND column_name='kitchen_station';
    `);

        if (results.length > 0) {
            console.log('✅ kitchen_station column already exists!');
            console.log('No migration needed.');
            process.exit(0);
        }

        console.log('⚠️ kitchen_station column does NOT exist. Adding it now...');

        // Add the column
        await sequelize.query(`
      ALTER TABLE menu_items 
      ADD COLUMN kitchen_station VARCHAR(50) NULL;
    `);

        console.log('✅ kitchen_station column added successfully!');
        console.log('Migration completed.');

        // Add comment
        await sequelize.query(`
      COMMENT ON COLUMN menu_items.kitchen_station IS 'Kitchen station: izgara, makarna, soguk, tatli';
    `);

        console.log('✅ Column comment added.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

runMigration();
