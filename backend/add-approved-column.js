/**
 * Migration script to add 'approved' column to orders table
 * Run this once to update the database schema
 */

const { sequelize } = require('./src/models');

async function addApprovedColumn() {
  try {
    console.log('🔧 Starting migration: Adding approved column to orders table...');
    
    // Add the approved column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Column "approved" added to orders table with default value false');
    
    // Update existing orders to have approved = false
    await sequelize.query(`
      UPDATE orders 
      SET approved = false 
      WHERE approved IS NULL;
    `);
    
    console.log('✅ All existing orders updated with approved = false');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addApprovedColumn();
