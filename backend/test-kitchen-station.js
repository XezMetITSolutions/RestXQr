// Test script to check and add kitchen_station column
const { sequelize } = require('./src/models');

async function testKitchenStation() {
    try {
        console.log('🔍 Checking kitchen_station column...');

        // Check if column exists
        const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='menu_items' AND column_name='kitchen_station';
    `);

        console.log('Query results:', results);

        if (results.length > 0) {
            console.log('✅ kitchen_station column EXISTS');
            console.log('Column details:', results[0]);
        } else {
            console.log('❌ kitchen_station column DOES NOT EXIST');
            console.log('Adding column now...');

            await sequelize.query(`
        ALTER TABLE menu_items 
        ADD COLUMN kitchen_station VARCHAR(50) NULL;
      `);

            console.log('✅ Column added successfully!');
        }

        // Test update
        console.log('\n🧪 Testing update with kitchen_station...');
        const [testResults] = await sequelize.query(`
      UPDATE menu_items 
      SET kitchen_station = 'izgara' 
      WHERE id = (SELECT id FROM menu_items LIMIT 1)
      RETURNING *;
    `);

        console.log('✅ Update test successful!');
        console.log('Updated item:', testResults[0]);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('SQL:', error.sql);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

testKitchenStation();
