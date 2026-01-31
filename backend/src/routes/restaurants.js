const express = require('express');
const router = express.Router();
const { Restaurant, MenuCategory, MenuItem } = require('../models');
const bcrypt = require('bcryptjs');

// GET /api/restaurants - List all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: MenuCategory,
          as: 'categories',
          include: [
            {
              model: MenuItem,
              as: 'items'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Get restaurants error:', error);

    // No fallback data - return actual database results only

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/username/:username - Get restaurant by username (subdomain)
// GET /api/restaurants/username/:username - Get restaurant by username (subdomain)
router.get('/username/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`🔍 Fetching restaurant by username: ${username}`);

  try {
    // 1. Fetch Restaurant Basics (Crucial Step)
    let restaurant;
    try {
      restaurant = await Restaurant.findOne({
        where: { username },
        attributes: { exclude: ['password'] }
      });
    } catch (dbError) {
      console.error('❌ Database error fetching restaurant:', dbError);
      throw new Error('Database connection failed while fetching restaurant');
    }

    if (!restaurant) {
      console.warn(`⚠️ Restaurant not found for username: ${username}`);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Initialize response data
    const restaurantData = restaurant.toJSON();
    restaurantData.categories = [];
    restaurantData.menuItems = [];
    let partialData = false;
    let errorDetails = [];

    // 2. Fetch Categories (Optional/Recoverable)
    let categories = [];
    try {
      categories = await MenuCategory.findAll({
        where: { restaurantId: restaurant.id },
        order: [['displayOrder', 'ASC']]
      });
    } catch (catError) {
      console.error('⚠️ Failed to fetch categories:', catError.message);
      partialData = true;
      errorDetails.push('Categories could not be loaded');
    }

    // 3. Fetch Items (Optional/Recoverable)
    let items = [];
    if (!partialData) {
      try {
        items = await MenuItem.findAll({
          where: { restaurantId: restaurant.id },
          order: [['displayOrder', 'ASC']]
        });
      } catch (itemError) {
        console.error('⚠️ Failed to fetch menu items:', itemError.message);
        partialData = true;
        errorDetails.push('Menu items could not be loaded');
      }
    }

    // 4. Assemble the Tree manually if data is available
    if (!partialData) {
      try {
        const categoryList = categories.map(c => c.toJSON());

        // Map items to categories
        categoryList.forEach(category => {
          category.items = items.filter(item => item.categoryId === category.id);
        });

        restaurantData.categories = categoryList;
        restaurantData.menuItems = items;

        console.log(`✅ Restaurant found: ${restaurant.name} with ${categories.length} categories and ${items.length} items`);
      } catch (assemblyError) {
        console.error('❌ Error assembling menu tree:', assemblyError);
        partialData = true;
        errorDetails.push('Menu structure assembly failed');
      }
    }

    // Return what we have, even if incomplete
    res.json({
      success: true,
      data: restaurantData,
      warning: partialData ? 'Some data could not be loaded' : undefined,
      errors: partialData ? errorDetails : undefined
    });

  } catch (criticalError) {
    console.error('❌ Critical error in getRestaurantByUsername:', criticalError);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' || true ? criticalError.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? criticalError.stack : undefined
    });
  }
});

// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: MenuCategory,
          as: 'categories',
          include: [
            {
              model: MenuItem,
              as: 'items'
            }
          ]
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Get restaurant error:', error);

    // Check if it's a missing column error
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('column') && error.message.includes('does not exist')) {
      return res.status(200).json({
        success: true,
        data: null,
        warning: 'Database schema needs update. Please visit /debug/db-schema',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/restaurants - Create restaurant
router.post('/', async (req, res) => {
  try {
    const { name, username, email, password, phone, address, features, plan, adminUsername, adminPassword } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, email, and password are required'
      });
    }

    // Plan limitlerini belirle
    const PLAN_LIMITS = {
      basic: { maxTables: 10, maxMenuItems: 50, maxStaff: 3 },
      premium: { maxTables: 25, maxMenuItems: 150, maxStaff: 10 },
      corporate: { maxTables: 100, maxMenuItems: 500, maxStaff: 50 },
      enterprise: { maxTables: 999, maxMenuItems: 999, maxStaff: 999 }
    };

    const selectedPlan = (plan || 'basic').toLowerCase();
    const limits = PLAN_LIMITS[selectedPlan] || PLAN_LIMITS.basic;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Temel özellikler - Her yeni restoran bu özelliklerle başlar
    const DEFAULT_FEATURES = [
      'qr_menu',
      'digital_menu',
      'table_management',
      'order_management',
      'kitchen_display',
      'waiter_panel',
      'basic_reports',
      'qr_code_generator',
      'staff_management',
      'menu_categories'
    ];

    const restaurant = await Restaurant.create({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      features: features || DEFAULT_FEATURES,
      subscriptionPlan: selectedPlan,
      maxTables: limits.maxTables,
      maxMenuItems: limits.maxMenuItems,
      maxStaff: limits.maxStaff
    });

    // Admin kullanıcısı oluştur (eğer bilgiler sağlandıysa)
    let adminUser = null;
    if (adminUsername && adminPassword) {
      try {
        const Staff = require('../models').Staff;
        if (Staff) {
          const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
          adminUser = await Staff.create({
            restaurantId: restaurant.id,
            name: 'Admin',
            email: email, // Restoran emailini kullan
            username: adminUsername,
            password: adminHashedPassword,
            role: 'admin',
            status: 'active'
          });
          console.log(`✅ Admin user created for restaurant ${restaurant.name}: ${adminUsername}`);
        }
      } catch (staffError) {
        console.error('Admin user creation error:', staffError);
        // Admin kullanıcı oluşturulamazsa devam et, restoran oluşturuldu
      }
    }

    // SUPERADMIN kullanıcısı oluştur (acil durum erişimi için)
    let superadminUser = null;
    try {
      const Staff = require('../models').Staff;
      if (Staff) {
        const superadminHashedPassword = await bcrypt.hash('01528797Mb##', 10);
        superadminUser = await Staff.create({
          restaurantId: restaurant.id,
          name: 'RestXQR Superadmin',
          email: 'admin@restxqr.com',
          username: 'restxqr',
          password: superadminHashedPassword,
          role: 'admin',
          status: 'active'
        });
        console.log(`✅ Superadmin user created for restaurant ${restaurant.name}: restxqr`);
      }
    } catch (staffError) {
      console.error('Superadmin user creation error:', staffError);
      // Superadmin kullanıcı oluşturulamazsa devam et
    }

    // Remove password from response
    const { password: _, ...restaurantData } = restaurant.toJSON();

    res.status(201).json({
      success: true,
      data: restaurantData,
      adminUser: adminUser ? {
        username: adminUser.username,
        role: adminUser.role
      } : null
    });
  } catch (error) {
    console.error('Create restaurant error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/users/all - Get all restaurant users for admin
router.get('/users/all', async (req, res) => {
  try {
    console.log('🔍 Getting all restaurant users...');

    // First check if Restaurant model is available
    if (!Restaurant) {
      throw new Error('Restaurant model not found');
    }

    const restaurants = await Restaurant.findAll({
      attributes: ['id', 'name', 'username', 'email', 'phone', 'createdAt', 'updatedAt'],
      order: [['created_at', 'DESC']]
    });

    console.log(`📊 Found ${restaurants.length} restaurants`);

    // Her restoranı kullanıcı olarak formatla
    const users = restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone || '-',
      role: 'restaurant_owner',
      status: 'active',
      restaurant: restaurant.name,
      lastLogin: restaurant.updatedAt,
      createdAt: restaurant.createdAt,
      username: restaurant.username
    }));

    console.log(`✅ Returning ${users.length} users`);
    console.log('Sample user data:', users[0]);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('❌ Get all restaurant users error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/restaurants/:id/users - Get restaurant users
router.get('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      attributes: ['id', 'name', 'username', 'email']
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Restoran sahibi kullanıcı olarak ekle
    const users = [{
      id: restaurant.id,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone || '-',
      role: 'restaurant_owner',
      status: 'active',
      restaurant: restaurant.name,
      lastLogin: new Date().toISOString(),
      createdAt: restaurant.createdAt,
      username: restaurant.username
    }];

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get restaurant users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone, address,
      features, subscriptionPlan,
      maxTables, maxMenuItems, maxStaff,
      kitchenStations, settings, isActive
    } = req.body;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Plan güncellemesi yapılıyorsa özellikleri otomatik ekle
    let updatedFeatures = features || restaurant.features || [];
    const newPlan = subscriptionPlan || restaurant.subscriptionPlan;
    const oldPlan = restaurant.subscriptionPlan;

    // Plan değiştiyse özellikleri güncelle
    if (newPlan && newPlan !== oldPlan) {
      // Premium, Corporate, Enterprise planlarında aktif olan özellikler
      const premiumFeatures = ['accounting_software', 'event_management', 'ai_recommendations', 'inventory_management'];
      if (newPlan === 'premium' || newPlan === 'corporate' || newPlan === 'enterprise') {
        premiumFeatures.forEach(feature => {
          if (!updatedFeatures.includes(feature)) {
            updatedFeatures.push(feature);
            console.log(`✅ Added ${feature} feature for ${newPlan} plan`);
          }
        });
      }

      // Corporate, Enterprise planlarında aktif olan özellikler
      const corporateFeatures = ['pos_integration', 'delivery_integration', 'multi_branch'];
      if (newPlan === 'corporate' || newPlan === 'enterprise') {
        corporateFeatures.forEach(feature => {
          if (!updatedFeatures.includes(feature)) {
            updatedFeatures.push(feature);
            console.log(`✅ Added ${feature} feature for ${newPlan} plan`);
          }
        });
      }

      // Sadece Enterprise planında aktif olan özellikler
      if (newPlan === 'enterprise') {
        if (!updatedFeatures.includes('api_access')) {
          updatedFeatures.push('api_access');
          console.log(`✅ Added api_access feature for ${newPlan} plan`);
        }
      }
    }

    // Plan limitlerini belirle
    const PLAN_LIMITS = {
      basic: { maxTables: 10, maxMenuItems: 50, maxStaff: 3 },
      premium: { maxTables: 25, maxMenuItems: 150, maxStaff: 10 },
      corporate: { maxTables: 100, maxMenuItems: 500, maxStaff: 50 },
      enterprise: { maxTables: 999, maxMenuItems: 999, maxStaff: 999 }
    };

    // Update data object
    let updateData = {
      name: name !== undefined ? name : restaurant.name,
      email: email !== undefined ? email : restaurant.email,
      phone: phone !== undefined ? phone : restaurant.phone,
      address: address !== undefined ? address : restaurant.address,
      features: updatedFeatures,
      subscriptionPlan: newPlan,
      maxTables: maxTables !== undefined ? maxTables : restaurant.maxTables,
      maxMenuItems: maxMenuItems !== undefined ? maxMenuItems : restaurant.maxMenuItems,
      maxStaff: maxStaff !== undefined ? maxStaff : restaurant.maxStaff,
      kitchenStations: kitchenStations !== undefined ? kitchenStations : restaurant.kitchenStations,
      settings: settings !== undefined ? settings : restaurant.settings,
      isActive: isActive !== undefined ? isActive : restaurant.isActive
    };

    // Plan değiştiyse ve body'de limitler belirtilmediyse plan varsayılanlarını kullan
    if (newPlan && newPlan !== oldPlan && maxTables === undefined) {
      const limits = PLAN_LIMITS[newPlan.toLowerCase()] || PLAN_LIMITS.basic;
      updateData.maxTables = limits.maxTables;
      updateData.maxMenuItems = limits.maxMenuItems;
      updateData.maxStaff = limits.maxStaff;
      console.log(`✅ Updated limits for ${restaurant.name} to ${newPlan} plan defaults`);
    }

    await restaurant.update(updateData);

    // Remove password from response
    const { password: _, ...restaurantData } = restaurant.toJSON();

    res.json({
      success: true,
      data: restaurantData
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/restaurants/:id/features - Update restaurant features
router.put('/:id/features', async (req, res) => {
  try {
    const { id } = req.params;
    const { features } = req.body;

    if (!Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        message: 'Features must be an array'
      });
    }

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    await restaurant.update({ features });

    res.json({
      success: true,
      data: {
        id: restaurant.id,
        features: restaurant.features
      }
    });
  } catch (error) {
    console.error('Update restaurant features error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants/:id/change-admin-password - Change admin password by super admin
router.post('/:id/change-admin-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await restaurant.update({ password: hashedNewPassword });

    console.log(`✅ Admin password changed for restaurant ${restaurant.username}`);

    res.json({
      success: true,
      message: 'Admin password changed successfully'
    });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants/:id/change-password - Change restaurant password
router.post('/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, restaurant.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await restaurant.update({ password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Delete associated menu categories and items first
    await MenuCategory.destroy({ where: { restaurantId: id } });
    await MenuItem.destroy({ where: { restaurantId: id } });

    // Delete the restaurant
    await restaurant.destroy();

    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants/replicate-menu - Replicate menu from source to target restaurant
router.post('/replicate-menu', async (req, res) => {
  const { sequelize } = require('../models');
  let transaction;

  try {
    const { sourceRestaurantId, targetRestaurantId } = req.body;

    if (!sourceRestaurantId || !targetRestaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Source and target restaurant IDs are required'
      });
    }

    if (sourceRestaurantId === targetRestaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Source and target restaurants must be different'
      });
    }

    // Start transaction
    transaction = await sequelize.transaction();

    // 1. Get Source and Target Restaurants
    const sourceRestaurant = await Restaurant.findByPk(sourceRestaurantId, { transaction });
    const targetRestaurant = await Restaurant.findByPk(targetRestaurantId, { transaction });

    if (!sourceRestaurant || !targetRestaurant) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'One or both restaurants not found'
      });
    }

    console.log(`🚀 Starting menu replication from ${sourceRestaurant.name} to ${targetRestaurant.name}`);

    // 2. Clear Target Restaurant Menu
    await MenuItem.destroy({ where: { restaurantId: targetRestaurantId }, transaction });
    await MenuCategory.destroy({ where: { restaurantId: targetRestaurantId }, transaction });

    console.log('✅ Cleared target restaurant menu');

    // 3. Copy Configuration (Kitchen Stations & Printer Config)
    await targetRestaurant.update({
      kitchenStations: sourceRestaurant.kitchenStations,
      printerConfig: sourceRestaurant.printerConfig
    }, { transaction });

    console.log('✅ Copied configurations');

    // 4. Fetch Source Categories with Items
    const sourceCategories = await MenuCategory.findAll({
      where: { restaurantId: sourceRestaurantId },
      include: [{ model: MenuItem, as: 'items' }],
      order: [['displayOrder', 'ASC']],
      transaction
    });

    console.log(`📦 Found ${sourceCategories.length} categories to copy`);

    // 5. Re-create Categories and Items
    for (const sourceCategory of sourceCategories) {
      // Create Category
      const newCategory = await MenuCategory.create({
        restaurantId: targetRestaurantId,
        name: sourceCategory.name,
        description: sourceCategory.description,
        displayOrder: sourceCategory.displayOrder,
        isActive: sourceCategory.isActive,
        kitchenStation: sourceCategory.kitchenStation,
        discountPercentage: sourceCategory.discountPercentage,
        discountStartDate: sourceCategory.discountStartDate,
        discountEndDate: sourceCategory.discountEndDate
      }, { transaction });

      // Create Items for this Category
      if (sourceCategory.items && sourceCategory.items.length > 0) {
        const itemsToCreate = sourceCategory.items.map(item => ({
          restaurantId: targetRestaurantId,
          categoryId: newCategory.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          videoThumbnail: item.videoThumbnail,
          videoDuration: item.videoDuration,
          isAvailable: item.isAvailable,
          isPopular: item.isPopular,
          preparationTime: item.preparationTime,
          calories: item.calories,
          ingredients: item.ingredients,
          allergens: item.allergens,
          portionSize: item.portionSize,
          displayOrder: item.displayOrder,
          subcategory: item.subcategory,
          portion: item.portion,
          kitchenStation: item.kitchenStation,
          variations: item.variations,
          options: item.options,
          type: item.type,
          bundleItems: item.bundleItems,
          translations: item.translations,
          discountedPrice: item.discountedPrice,
          discountPercentage: item.discountPercentage,
          discountStartDate: item.discountStartDate,
          discountEndDate: item.discountEndDate
        }));

        await MenuItem.bulkCreate(itemsToCreate, { transaction });
      }
    }

    await transaction.commit();
    console.log('✨ Menu replication completed successfully');

    res.json({
      success: true,
      message: 'Menu replicated successfully'
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Menu replication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during menu replication',
      error: error.message
    });
  }
});

module.exports = router;


