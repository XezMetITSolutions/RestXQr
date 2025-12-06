const express = require('express');
const router = express.Router();
const { POSDevice } = require('../models');

// GET /api/pos - List all POS devices for a restaurant
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    const devices = await POSDevice.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Get POS devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/pos/:id - Get single POS device
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await POSDevice.findByPk(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'POS device not found'
      });
    }
    
    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Get POS device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/pos - Create new POS device
router.post('/', async (req, res) => {
  try {
    const deviceData = req.body;
    
    const device = await POSDevice.create(deviceData);
    
    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Create POS device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/pos/:id - Update POS device
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const device = await POSDevice.findByPk(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'POS device not found'
      });
    }
    
    await device.update(updateData);
    
    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Update POS device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/pos/:id - Delete POS device
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await POSDevice.findByPk(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'POS device not found'
      });
    }
    
    await device.destroy();
    
    res.json({
      success: true,
      message: 'POS device deleted successfully'
    });
  } catch (error) {
    console.error('Delete POS device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/pos/:id/sync - Sync POS device
router.post('/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await POSDevice.findByPk(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'POS device not found'
      });
    }
    
    await device.update({ 
      status: 'syncing',
      lastSync: new Date()
    });
    
    // Simulate sync process
    setTimeout(async () => {
      await device.update({ status: 'online' });
    }, 2000);
    
    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Sync POS device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
