/**
 * Emergency 2FA Disable Script
 * 
 * Bu script, 2FA'yı acil durumda devre dışı bırakmak için kullanılır.
 * Doğrudan veritabanında AdminUser tablosunu günceller.
 * 
 * Kullanım:
 * node disable-2fa.js <username>
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/masapp', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function disableUserTwoFactor(username) {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');

    // Update user directly
    const result = await sequelize.query(
      `UPDATE "admin_users" SET 
       "two_factor_enabled" = false, 
       "two_factor_secret" = NULL, 
       "backup_codes" = NULL 
       WHERE "username" = :username OR "email" = :username`,
      {
        replacements: { username },
        type: Sequelize.QueryTypes.UPDATE
      }
    );

    if (result[1] === 0) {
      console.log(`❌ No user found with username or email: ${username}`);
      return;
    }

    console.log(`✅ 2FA disabled successfully for user: ${username}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Get username from command line arguments
const username = process.argv[2];

if (!username) {
  console.log('❌ Please provide a username or email');
  console.log('Usage: node disable-2fa.js <username>');
  process.exit(1);
}

// Run the script
disableUserTwoFactor(username);
