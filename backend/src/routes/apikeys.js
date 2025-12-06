const express = require('express');
const router = express.Router();
const { ApiKey } = require('../models');
const crypto = require('crypto');

// Generate API key
const generateApiKey = () => {
  return 'rxqr_' + crypto.randomBytes(32).toString('hex');
};

// GET /api/apikeys - List all API keys for a restaurant
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    const apiKeys = await ApiKey.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/apikeys/:id - Get single API key
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const apiKey = await ApiKey.findByPk(id);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }
    
    res.json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/apikeys - Create new API key
router.post('/', async (req, res) => {
  try {
    const { restaurantId, name, permissions, expiresAt } = req.body;
    
    const apiKey = await ApiKey.create({
      restaurantId,
      name,
      key: generateApiKey(),
      permissions: permissions || [],
      expiresAt
    });
    
    res.status(201).json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/apikeys/:id - Update API key
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const apiKey = await ApiKey.findByPk(id);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }
    
    await apiKey.update(updateData);
    
    res.json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/apikeys/:id - Delete API key
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const apiKey = await ApiKey.findByPk(id);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }
    
    await apiKey.destroy();
    
    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/apikeys/:id/regenerate - Regenerate API key
router.post('/:id/regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const apiKey = await ApiKey.findByPk(id);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }
    
    await apiKey.update({ key: generateApiKey() });
    
    res.json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
