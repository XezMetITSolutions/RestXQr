const { Restaurant, Staff, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');

async function fixRestaurants() {
    try {
        const restaurants = await Restaurant.findAll();
        console.log(`Checking ${restaurants.length} restaurants...`);

        const PLAN_LIMITS = {
            basic: { maxTables: 10, maxMenuItems: 50, maxStaff: 3 },
            premium: { maxTables: 25, maxMenuItems: 150, maxStaff: 10 },
            enterprise: { maxTables: 999, maxMenuItems: 999, maxStaff: 999 }
        };

        const superadminPassword = await bcrypt.hash('01528797Mb##', 10);

        for (const restaurant of restaurants) {
            console.log(`Processing ${restaurant.name} (${restaurant.subscriptionPlan})...`);

            // 1. Fix limits based on plan
            const limits = PLAN_LIMITS[restaurant.subscriptionPlan] || PLAN_LIMITS.basic;

            const needsUpdate =
                restaurant.maxTables !== limits.maxTables ||
                restaurant.maxMenuItems !== limits.maxMenuItems ||
                restaurant.maxStaff !== limits.maxStaff;

            if (needsUpdate) {
                await restaurant.update({
                    maxTables: limits.maxTables,
                    maxMenuItems: limits.maxMenuItems,
                    maxStaff: limits.maxStaff
                });
                console.log(`✅ Fixed limits for ${restaurant.name}`);
            } else {
                console.log(`ℹ️ Limits for ${restaurant.name} are already correct`);
            }

            // 2. Ensure superadmin user exists
            const [staff, created] = await Staff.findOrCreate({
                where: {
                    restaurantId: restaurant.id,
                    username: 'restxqr'
                },
                defaults: {
                    name: 'RestXQR Superadmin',
                    email: 'admin@restxqr.com',
                    password: superadminPassword,
                    role: 'admin',
                    isActive: true
                }
            });

            if (created) {
                console.log(`✅ Created restxqr superadmin for ${restaurant.name}`);
            } else {
                // Update password anyway to be sure
                await staff.update({ password: superadminPassword, role: 'admin', isActive: true });
                console.log(`ℹ️ Corrected restxqr superadmin for ${restaurant.name}`);
            }
        }

        console.log('All done!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing restaurants:', error);
        process.exit(1);
    }
}

fixRestaurants();
