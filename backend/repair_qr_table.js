const { sequelize } = require('./src/models');

async function repairQRTable() {
    try {
        console.log('--- Repairing qr_tokens table structure ---');

        // 1. Rename columns if they exist in CamelCase
        const columnsToFix = [
            ['restaurantId', 'restaurant_id'],
            ['tableNumber', 'table_number'],
            ['expiresAt', 'expires_at'],
            ['isActive', 'is_active'],
            ['sessionId', 'session_id'],
            ['usedAt', 'used_at'],
            ['createdBy', 'created_by']
        ];

        for (const [oldName, newName] of columnsToFix) {
            try {
                await sequelize.query(`ALTER TABLE qr_tokens RENAME COLUMN "${oldName}" TO ${newName}`);
                console.log(`✅ Renamed ${oldName} to ${newName}`);
            } catch (err) {
                // Ignore if old column doesn't exist
                if (err.message.includes('does not exist')) {
                    // console.log(`ℹ️ Column ${oldName} not found, already correct or never created.`);
                } else {
                    console.error(`❌ Error renaming ${oldName}:`, err.message);
                }
            }
        }

        // 2. Ensure types are correct if they were created differently
        // (Just a sample, usually not needed if sync() was used)

        console.log('✅ QR tokens table structure check completed.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Repair failed:', e);
        process.exit(1);
    }
}

repairQRTable();
