const express = require('express');
const router = express.Router();
const { Delivery } = require('../models');

// GET /api/deliveries - List all deliveries for a restaurant
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    const deliveries = await Delivery.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/deliveries/:id - Get single delivery
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const delivery = await Delivery.findByPk(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/deliveries - Create new delivery
router.post('/', async (req, res) => {
  try {
    const deliveryData = req.body;
    
    // Generate order number if not provided
    if (!deliveryData.orderNumber) {
      deliveryData.orderNumber = 'ORD-' + Date.now();
    }
    
    const delivery = await Delivery.create(deliveryData);
    
    res.status(201).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/deliveries/:id - Update delivery
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const delivery = await Delivery.findByPk(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    await delivery.update(updateData);
    
    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/deliveries/:id - Delete delivery
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const delivery = await Delivery.findByPk(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    await delivery.destroy();
    
    res.json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (error) {
    console.error('Delete delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
