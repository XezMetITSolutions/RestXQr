const express = require('express');
const router = express.Router();
const { AIRecommendation } = require('../models');

// GET /api/ai - List all AI recommendations for a restaurant
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    const recommendations = await AIRecommendation.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get AI recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/ai/:id - Get single AI recommendation
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const recommendation = await AIRecommendation.findByPk(id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'AI recommendation not found'
      });
    }
    
    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Get AI recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/ai - Create new AI recommendation
router.post('/', async (req, res) => {
  try {
    const recommendationData = req.body;
    
    const recommendation = await AIRecommendation.create(recommendationData);
    
    res.status(201).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Create AI recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/ai/:id - Update AI recommendation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const recommendation = await AIRecommendation.findByPk(id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'AI recommendation not found'
      });
    }
    
    await recommendation.update(updateData);
    
    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Update AI recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/ai/:id - Delete AI recommendation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const recommendation = await AIRecommendation.findByPk(id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'AI recommendation not found'
      });
    }
    
    await recommendation.destroy();
    
    res.json({
      success: true,
      message: 'AI recommendation deleted successfully'
    });
  } catch (error) {
    console.error('Delete AI recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
