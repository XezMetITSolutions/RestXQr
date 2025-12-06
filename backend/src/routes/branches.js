const express = require('express');
const router = express.Router();
const { Branch } = require('../models');

// GET /api/branches - List all branches for a restaurant
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    const branches = await Branch.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/branches/:id - Get single branch
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const branch = await Branch.findByPk(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/branches - Create new branch
router.post('/', async (req, res) => {
  try {
    const branchData = req.body;
    
    const branch = await Branch.create(branchData);
    
    res.status(201).json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/branches/:id - Update branch
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const branch = await Branch.findByPk(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    await branch.update(updateData);
    
    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/branches/:id - Delete branch
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const branch = await Branch.findByPk(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    await branch.destroy();
    
    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
