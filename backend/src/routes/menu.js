const express = require('express');
const router = express.Router();
const { Restaurant, MenuCategory, MenuItem } = require('../models');

// GET /api/restaurants/:restaurantId/menu - Get all menu data (categories and items) for a restaurant
router.get('/:restaurantId/menu', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get all categories with their items
    const categories = await MenuCategory.findAll({
      where: { restaurantId },
      include: [
        {
          model: MenuItem,
          as: 'items',
          required: false
        }
      ],
      order: [
        ['displayOrder', 'ASC'],
        [{ model: MenuItem, as: 'items' }, 'displayOrder', 'ASC']
      ]
    });

    // Get all items separately for easier access
    const items = await MenuItem.findAll({
      include: [
        {
          model: MenuCategory,
          as: 'category',
          where: { restaurantId },
          attributes: ['id', 'name']
        }
      ],
      order: [['displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        categories: categories,
        items: items
      }
    });

  } catch (error) {
    console.error('Get restaurant menu error:', error);

    // Check for common Sequelize errors that indicate schema issues
    const isSchemaError =
      (error.name === 'SequelizeDatabaseError' && (
        error.message.includes('column') ||
        error.message.includes('does not exist') ||
        error.message.includes('relation') ||
        error.original?.code === '42703' // PostgreSQL undefined_column
      )) ||
      error.name === 'SequelizeValidationError';

    if (isSchemaError) {
      return res.status(200).json({
        success: true,
        data: { categories: [], items: [] },
        warning: 'Veritabanı şeması güncel değil. Bazı sütunlar eksik olabilir.',
        suggestion: 'Lütfen /api/admin-fix/fix-db-schema adresini ziyaret ederek şemayı düzeltin.',
        error: error.message,
        details: error.original?.detail
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

// GET /api/restaurants/:restaurantId/menu/categories - Get all categories for a restaurant
router.get('/:restaurantId/menu/categories', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const categories = await MenuCategory.findAll({
      where: { restaurantId },
      include: [
        {
          model: MenuItem,
          as: 'items',
          required: false
        }
      ],
      order: [['displayOrder', 'ASC'], [{ model: MenuItem, as: 'items' }, 'displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get menu categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants/:restaurantId/menu/categories - Create new category
router.post('/:restaurantId/menu/categories', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, description, order, isActive, discountPercentage, discountStartDate, discountEndDate } = req.body;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Handle both simple string and object format for name
    let categoryName = name;
    if (typeof name === 'object' && name.tr) {
      categoryName = name.tr; // Use Turkish name if object format
    }

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Handle description
    let categoryDescription = description;
    if (typeof description === 'object' && description.tr) {
      categoryDescription = description.tr;
    }

    const category = await MenuCategory.create({
      restaurantId,
      name: categoryName,
      description: categoryDescription || null,
      displayOrder: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true,
      discountPercentage: discountPercentage || null,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : null
    });

    res.status(201).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Create menu category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/restaurants/:restaurantId/menu/categories/:categoryId - Update category
router.put('/:restaurantId/menu/categories/:categoryId', async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.params;
    const { name, description, order, isActive, discountPercentage, discountStartDate, discountEndDate } = req.body;

    const category = await MenuCategory.findOne({
      where: { id: categoryId, restaurantId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Handle both simple string and object format for name
    let categoryName = category.name;
    if (name) {
      categoryName = typeof name === 'object' && name.tr ? name.tr : name;
    }

    // Handle description
    let categoryDescription = category.description;
    if (description !== undefined) {
      categoryDescription = typeof description === 'object' && description.tr ? description.tr : description;
    }

    await category.update({
      name: categoryName,
      description: categoryDescription,
      displayOrder: order !== undefined ? order : category.displayOrder,
      isActive: isActive !== undefined ? isActive : category.isActive,
      discountPercentage: discountPercentage !== undefined ? discountPercentage : category.discountPercentage,
      discountStartDate: discountStartDate !== undefined ? (discountStartDate ? new Date(discountStartDate) : null) : category.discountStartDate,
      discountEndDate: discountEndDate !== undefined ? (discountEndDate ? new Date(discountEndDate) : null) : category.discountEndDate
    });

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Update menu category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/restaurants/:restaurantId/menu/categories/:categoryId - Delete category
router.delete('/:restaurantId/menu/categories/:categoryId', async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.params;

    const category = await MenuCategory.findOne({
      where: { id: categoryId, restaurantId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Delete all items in this category first
    await MenuItem.destroy({
      where: { categoryId }
    });

    // Delete the category
    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/:restaurantId/menu/items - Get all menu items for a restaurant
router.get('/:restaurantId/menu/items', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const items = await MenuItem.findAll({
      include: [
        {
          model: MenuCategory,
          as: 'category',
          where: { restaurantId },
          attributes: ['id', 'name']
        }
      ],
      order: [['displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: items
    });

  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/restaurants/:restaurantId/menu/items/:itemId - Get a single menu item
router.get('/:restaurantId/menu/items/:itemId', async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;

    const item = await MenuItem.findOne({
      where: { id: itemId, restaurantId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Get single menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// POST /api/restaurants/:restaurantId/menu/items - Create new menu item
router.post('/:restaurantId/menu/items', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log('Backend - POST /menu/items çağrıldı:', { restaurantId });
    console.log('Backend - Request body:', req.body);

    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      image, // Fallback için image field'ını da al
      allergens,
      ingredients,
      nutritionInfo,
      order,
      isActive,
      isAvailable,
      isPopular,
      preparationTime,
      calories,
      subcategory,
      portion,
      kitchenStation,
      variants,
      translations,
      discountPercentage,
      discountedPrice,
      discountStartDate,
      discountEndDate
    } = req.body;

    console.log('Backend - imageUrl uzunluğu:', imageUrl?.length || 0);
    console.log('Backend - image uzunluğu:', image?.length || 0);

    // Verify category belongs to restaurant
    const category = await MenuCategory.findOne({
      where: { id: categoryId, restaurantId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Plan limiti kontrolü - Maksimum menü ürünü sayısı
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (restaurant) {
      const maxMenuItems = restaurant.maxMenuItems || 50;
      const currentItemCount = await MenuItem.count({ where: { restaurantId } });

      if (currentItemCount >= maxMenuItems) {
        console.error(`❌ Menu item limit exceeded: ${currentItemCount} >= ${maxMenuItems}`);
        return res.status(403).json({
          success: false,
          message: `Plan limitiniz aşıldı! Maksimum ${maxMenuItems} menü ürünü ekleyebilirsiniz. Paketinizi yükseltin.`,
          limit: maxMenuItems,
          current: currentItemCount,
          upgradeRequired: true
        });
      }
    }

    // Handle both simple string and object format for name
    let itemName = name;
    if (typeof name === 'object' && name.tr) {
      itemName = name.tr;
    }

    if (!itemName || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    // Handle description
    let itemDescription = description;
    if (typeof description === 'object' && description.tr) {
      itemDescription = description.tr;
    }

    const finalImageUrl = imageUrl || image || null;
    console.log('Backend - Final imageUrl uzunluğu:', finalImageUrl?.length || 0);
    console.log('Backend - Final imageUrl başlangıcı:', finalImageUrl?.substring(0, 50) || 'null');

    console.log('Backend - Create menu item request:', {
      name,
      allergens: allergens,
      allergensType: typeof allergens,
      allergensLength: allergens?.length
    });

    const item = await MenuItem.create({
      restaurantId,
      categoryId,
      name: itemName,
      description: itemDescription || null,
      price: parseFloat(price),
      imageUrl: finalImageUrl,
      displayOrder: order || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isPopular: isPopular || false,
      calories: calories || null,
      subcategory: subcategory || null,
      ingredients: ingredients || null,
      allergens: allergens || [],
      portion: portion || null,
      portionSize: portion || null,
      kitchenStation: kitchenStation || null,
      variations: req.body.variations || [],
      options: req.body.options || [],
      type: req.body.type || 'single',
      bundleItems: req.body.bundleItems || [],
      translations: translations || {},
      discountPercentage: discountPercentage || null,
      discountedPrice: discountedPrice || null,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : null
    });

    console.log('Backend - Oluşturulan item:', {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl?.substring(0, 50) + '...'
    });

    res.status(201).json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Create menu item error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/restaurants/:restaurantId/menu/items/:itemId - Update menu item
router.put('/:restaurantId/menu/items/:itemId', async (req, res) => {
  let updateData = null;
  try {
    const { restaurantId, itemId } = req.params;
    updateData = req.body;

    // Find item and verify it belongs to the restaurant
    const item = await MenuItem.findOne({
      where: { id: itemId, restaurantId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // If categoryId is being updated, verify new category belongs to restaurant
    if (updateData.categoryId) {
      const newCategory = await MenuCategory.findOne({
        where: { id: updateData.categoryId, restaurantId }
      });

      if (!newCategory) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    // Verify restaurant ID matches (security check)
    // if (item.category.restaurantId !== restaurantId) ... (already checked via include)

    // Sanitize and prepare update data
    const fieldsToUpdate = {};
    const allowedFields = [
      'name', 'description', 'price', 'imageUrl', 'isAvailable', 'isPopular',
      'preparationTime', 'calories', 'ingredients', 'portion', 'portionSize',
      'displayOrder', 'subcategory', 'kitchenStation', 'videoUrl', 'videoThumbnail',
      'videoDuration', 'type', 'discountPercentage', 'discountedPrice',
      'discountStartDate', 'discountEndDate'
    ];

    // List of fields that should be numeric or date
    const numericFields = ['price', 'preparationTime', 'calories', 'displayOrder', 'discountPercentage', 'discountedPrice'];
    const dateFields = ['discountStartDate', 'discountEndDate'];

    // Copy allowed simple fields
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        let value = updateData[field];

        // Handle empty strings for numeric/date fields
        if (value === "" && (numericFields.includes(field) || dateFields.includes(field))) {
          value = null;
        }

        // Handle numeric conversion
        if (value !== null && numericFields.includes(field) && typeof value === 'string') {
          value = parseFloat(value);
          if (isNaN(value)) value = null;
        }

        // Handle date conversion
        if (value !== null && dateFields.includes(field) && typeof value === 'string') {
          value = new Date(value);
          if (isNaN(value.getTime())) value = null;
        }

        fieldsToUpdate[field] = value;
      }
    });

    // Handle JSON fields safely
    if (updateData.variations) {
      fieldsToUpdate.variations = typeof updateData.variations === 'string'
        ? JSON.parse(updateData.variations)
        : updateData.variations;
    }

    if (updateData.options) {
      fieldsToUpdate.options = typeof updateData.options === 'string'
        ? JSON.parse(updateData.options)
        : updateData.options;
    }

    if (updateData.allergens) {
      fieldsToUpdate.allergens = typeof updateData.allergens === 'string'
        ? JSON.parse(updateData.allergens)
        : updateData.allergens;
    }

    if (updateData.bundleItems) {
      fieldsToUpdate.bundleItems = typeof updateData.bundleItems === 'string'
        ? JSON.parse(updateData.bundleItems)
        : updateData.bundleItems;
    }

    // Handle specific logic for price
    if (updateData.price) {
      fieldsToUpdate.price = parseFloat(updateData.price);
    }

    // Handle category change
    if (updateData.categoryId) {
      fieldsToUpdate.categoryId = updateData.categoryId;
    }

    console.log(`📝 Updating item ${itemId} with sanitized data:`, JSON.stringify(fieldsToUpdate, null, 2));

    await item.update(fieldsToUpdate);

    res.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      sql: error.sql,
      original: error.original
    });
    console.error('Update data received:', updateData);
    const isSchemaError =
      (error.name === 'SequelizeDatabaseError' && (
        error.message.includes('column') ||
        error.message.includes('does not exist') ||
        error.original?.code === '42703'
      ));

    res.status(500).json({
      success: false,
      message: isSchemaError ? 'Veritabanı şeması güncel değil. Eksik sütunlar var.' : 'Internal server error',
      error: error.message,
      suggestion: isSchemaError ? 'Lütfen /business/debug/campaign-fix adresine giderek şemayı düzeltin.' : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        sql: error.sql,
        fields: Object.keys(updateData || {})
      } : undefined
    });
  }
});

// DELETE /api/restaurants/:restaurantId/menu/items/:itemId - Delete menu item
router.delete('/:restaurantId/menu/items/:itemId', async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;

    // Find item and verify it belongs to the restaurant
    const item = await MenuItem.findOne({
      include: [
        {
          model: MenuCategory,
          as: 'category',
          where: { restaurantId }
        }
      ],
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await item.destroy();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/restaurants/:restaurantId/menu/reorder - Reorder categories and items
router.post('/:restaurantId/menu/reorder', async (req, res) => {
  const t = await require('../models').sequelize.transaction();

  try {
    const { restaurantId } = req.params;
    const { categories, items } = req.body;

    // Validate restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Update Category Orders
    if (categories && Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.id && typeof cat.displayOrder === 'number') {
          await MenuCategory.update(
            { displayOrder: cat.displayOrder },
            {
              where: { id: cat.id, restaurantId },
              transaction: t
            }
          );
        }
      }
    }

    // Update Item Orders
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.id && typeof item.displayOrder === 'number') {
          await MenuItem.update(
            { displayOrder: item.displayOrder },
            {
              where: { id: item.id, restaurantId },
              transaction: t
            }
          );
        }
      }
    }

    await t.commit();

    res.json({
      success: true,
      message: 'Menu order updated successfully'
    });

  } catch (error) {
    await t.rollback();
    console.error('Reorder menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
