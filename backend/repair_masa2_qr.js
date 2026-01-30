const { QRToken } = require('./src/models');

async function repairMasa2() {
    try {
        const restaurantId = '37b0322a-e11f-4ef1-b108-83be310aaf4d'; // From logs
        const tableNumber = 2;

        console.log(`Searching for deactivated tokens for Table ${tableNumber}...`);
        const token = await QRToken.findOne({
            where: {
                restaurantId,
                tableNumber,
                isActive: false
            },
            order: [['updatedAt', 'DESC']]
        });

        if (token) {
            console.log(`Found token: ${token.token}. Reactivating...`);
            await token.update({ isActive: true });
            console.log('✅ Token reactivated successfully!');
        } else {
            console.log('❌ No deactivated token found for Table 2.');
        }
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

repairMasa2();
