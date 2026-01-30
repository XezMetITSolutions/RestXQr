const { sequelize } = require('./src/models');

async function fixSchema() {
    console.log('🔧 Starting schema fix for menu_items table...');

    try {
        const columnsToAdd = [
            { name: 'type', type: 'VARCHAR(20) DEFAULT \'single\'' },
            { name: 'bundle_items', type: 'JSONB DEFAULT \'[]\'::jsonb' },
            { name: 'variations', type: 'JSONB DEFAULT \'[]\'::jsonb' },
            { name: 'options', type: 'JSONB DEFAULT \'[]\'::jsonb' },
            { name: 'translations', type: 'JSONB DEFAULT \'{}\'::jsonb' },
            { name: 'kitchen_station', type: 'VARCHAR(50) NULL' }
        ];

        for (const col of columnsToAdd) {
            // Check if column exists
            const [results] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='menu_items' AND column_name='${col.name}';
      `);

            if (results.length === 0) {
                console.log(`⚙️ Adding missing column: ${col.name}`);
                await sequelize.query(`
          ALTER TABLE menu_items 
          ADD COLUMN ${col.name} ${col.type};
        `);
                console.log(`✅ Added ${col.name}`);
            } else {
                console.log(`ℹ️ Column ${col.name} already exists`);
            }
        }

        console.log('✨ Schema fix completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema fix failed:', error);
        process.exit(1);
    }
}

fixSchema();
