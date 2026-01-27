const { Restaurant, MenuCategory, MenuItem, connectDB } = require('./src/models');

async function updateKrorenStations() {
    try {
        console.log('🔍 Connecting to database...');
        // Force DATABASE_URL if not present
        if (!process.env.DATABASE_URL) {
            process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/masapp';
            console.log('⚠️ Using default local DATABASE_URL');
        }

        try {
            await connectDB();
        } catch (e) {
            console.log('❌ Connection failed:', e.message);
            // Try one more common one
            process.env.DATABASE_URL = 'postgresql://postgres:123456@localhost:5432/masapp';
            console.log('⚠️ Trying with password 123456...');
            await connectDB();
        }

        console.log('🔍 Finding Kroren restaurant...');
        const kroren = await Restaurant.findOne({ where: { username: 'kroren' } });
        if (!kroren) {
            console.error('❌ Kroren restaurant not found');
            return;
        }

        const categories = await MenuCategory.findAll({ where: { restaurantId: kroren.id } });
        console.log(`📊 Found ${categories.length} categories`);

        const mapping = {
            'tavuk': 'kavurma',
            'dana': 'kavurma',
            'sebze': 'kavurma',
            'tofu': 'kavurma',
            'kavurma': 'kavurma',
            'atıştırmalık': 'kavurma',
            'yan ürün': 'kavurma',
            'ramen': 'ramen',
            'noodle': 'ramen',
            'makarna': 'ramen',
            'sushi': 'ramen',
            'mantı': 'manti',
            'başlangıç': 'manti',
            'salata': 'manti',
            'içecek': 'icecek1'
        };

        for (const cat of categories) {
            let station = null;
            const name = cat.name.toLowerCase();

            // Find the best match
            for (const [key, val] of Object.entries(mapping)) {
                if (name.includes(key)) {
                    station = val;
                    break;
                }
            }

            if (station) {
                console.log(`📁 Updating category: ${cat.name} -> Station: ${station}`);
                await cat.update({ kitchenStation: station });

                // Also update all items in this category to inherit the station
                const [updatedItemsCount] = await MenuItem.update(
                    { kitchenStation: station },
                    { where: { categoryId: cat.id } }
                );
                console.log(`   └─ Updated ${updatedItemsCount} items`);
            } else {
                console.log(`⚠️ No mapping found for category: ${cat.name}`);
            }
        }

        console.log('✅ All categories and items updated successfully');
    } catch (error) {
        console.error('❌ Error updating stations:', error.message);
    } finally {
        process.exit(0);
    }
}

updateKrorenStations();
