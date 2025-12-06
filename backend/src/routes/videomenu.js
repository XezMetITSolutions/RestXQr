const express = require('express');
const router = express.Router();
const { VideoMenuItem } = require('../models');

// GET /api/videomenu - List all video menu items for a restaurant
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    const items = await VideoMenuItem.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get video menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/videomenu/:id - Get single video menu item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await VideoMenuItem.findByPk(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Video menu item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get video menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/videomenu - Create new video menu item
router.post('/', async (req, res) => {
  try {
    const itemData = req.body;
    
    const item = await VideoMenuItem.create(itemData);
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Create video menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/videomenu/:id - Update video menu item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const item = await VideoMenuItem.findByPk(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Video menu item not found'
      });
    }
    
    await item.update(updateData);
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Update video menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/videomenu/:id - Delete video menu item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await VideoMenuItem.findByPk(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Video menu item not found'
      });
    }
    
    await item.destroy();
    
    res.json({
      success: true,
      message: 'Video menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete video menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/videomenu/:id/view - Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await VideoMenuItem.findByPk(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Video menu item not found'
      });
    }
    
    await item.increment('views');
    await item.reload();
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Increment view count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
