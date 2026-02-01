const { QRToken } = require('./src/models');

async function reactivateKrorenTokens() {
    try {
        const restaurantId = '37b0322a-e11f-4ef1-b108-83be310aaf4d'; // Kroren ID
        console.log(`Reactivating all deactivated tokens for Kroren (${restaurantId})...`);

        const [updatedCount] = await QRToken.update(
            { isActive: true },
            {
                where: {
                    restaurantId,
                    isActive: false
                }
            }
        );

        console.log(`✅ ${updatedCount} tokens reactivated successfully!`);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

reactivateKrorenTokens();
