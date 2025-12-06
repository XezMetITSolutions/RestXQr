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
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
    const { name, description, order, isActive } = req.body;
    
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
      isActive: isActive !== undefined ? isActive : true
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
    const { name, description, order, isActive } = req.body;
    
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
      isActive: isActive !== undefined ? isActive : category.isActive
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
      portion
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
      preparationTime: preparationTime || null,
      calories: calories || null,
      subcategory: subcategory || null,
      ingredients: ingredients || null,
      allergens: allergens || [],
      portion: portion || null,
      portionSize: portion || null
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
  try {
    const { restaurantId, itemId } = req.params;
    const updateData = req.body;
    
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
    
    await item.update(updateData);
    
    res.json({
      success: true,
      data: item
    });
    
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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

module.exports = router;
