const { Restaurant, MenuCategory, MenuItem } = require('../models');
const { uploadToCloudinary } = require('../lib/cloudinary');
const axios = require('axios');

async function importKrorenMenu(menuData) {
    const results = {
        added: 0,
        skipped: 0,
        errors: [],
        details: []
    };

    try {
        // 1. Find or Create Kroren Restaurant
        let kroren = await Restaurant.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { username: 'kroren' },
                    { name: { [require('sequelize').Op.iLike]: '%kroren%' } }
                ]
            }
        });

        if (!kroren) {
            console.log('📝 Kroren not found, creating new restaurant...');
            kroren = await Restaurant.create({
                name: 'Kroren Kadıköy',
                username: 'kroren',
                email: 'info@kroren.com',
                password: 'ChangeMe123!', // Temporary password
                isActive: true
            });
            console.log('✅ Created restaurant:', kroren.name);
        }

        console.log(`🚀 Starting import for ${kroren.name} (${kroren.id})`);

        // 2. Get existing items to check for duplicates
        const existingItems = await MenuItem.findAll({
            where: { restaurantId: kroren.id },
            attributes: ['name']
        });
        const existingNames = new Set(existingItems.map(item => item.name.toLowerCase()));

        // 3. Process Categories
        const categoryCache = {};
        const categoriesInDB = await MenuCategory.findAll({
            where: { restaurantId: kroren.id }
        });
        categoriesInDB.forEach(cat => {
            categoryCache[cat.name.toLowerCase()] = cat.id;
        });

        // 4. Process individual items
        for (const item of menuData) {
            const itemNameLower = item.name.toLowerCase();

            // Duplicate Check
            if (existingNames.has(itemNameLower)) {
                console.log(`⏭️ Skipping duplicate: ${item.name}`);
                results.skipped++;
                continue;
            }

            try {
                // Ensure Category Exists
                const categoryName = item.category || 'Diğer';
                const categoryNameLower = categoryName.toLowerCase();
                let categoryId = categoryCache[categoryNameLower];

                if (!categoryId) {
                    const newCategory = await MenuCategory.create({
                        restaurantId: kroren.id,
                        name: categoryName,
                        isActive: true,
                        displayOrder: 99
                    });
                    categoryId = newCategory.id;
                    categoryCache[categoryNameLower] = categoryId;
                    console.log(`📁 Created new category: ${categoryName}`);
                }

                // Handle Image
                let cloudinaryUrl = null;
                if (item.imageUrl && item.imageUrl.startsWith('http')) {
                    try {
                        console.log(`📸 Downloading image for ${item.name}...`);
                        const imageResponse = await axios.get(item.imageUrl, { responseType: 'arraybuffer' });
                        const buffer = Buffer.from(imageResponse.data, 'binary');

                        const uploadResult = await uploadToCloudinary(buffer, {
                            folder: 'restxqr/products',
                            public_id: `kroren_${Date.now()}_${Math.round(Math.random() * 1000)}`
                        });
                        cloudinaryUrl = uploadResult.secure_url;
                        console.log(`✅ Uploaded to Cloudinary: ${cloudinaryUrl}`);
                    } catch (imgError) {
                        console.error(`⚠️ Failed to upload image for ${item.name}:`, imgError.message);
                    }
                }

                // Clean price string to decimal
                const priceValue = parseFloat(item.price.replace('₺', '').replace(',', '').trim()) || 0;

                // Create Menu Item
                await MenuItem.create({
                    restaurantId: kroren.id,
                    categoryId: categoryId,
                    name: item.name,
                    description: item.description || '',
                    price: priceValue,
                    imageUrl: cloudinaryUrl,
                    isActive: true,
                    isAvailable: true
                });

                console.log(`✨ Imported: ${item.name}`);
                results.added++;
                results.details.push({ name: item.name, status: 'success' });

            } catch (itemError) {
                console.error(`❌ Error importing ${item.name}:`, itemError);
                results.errors.push({ name: item.name, error: itemError.message });
            }
        }

        return results;

    } catch (error) {
        console.error('❌ Global Import Error:', error);
        throw error;
    }
}

module.exports = { importKrorenMenu };
