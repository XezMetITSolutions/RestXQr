const express = require('express');
const router = express.Router();
const { Restaurant, Table } = require('../models');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Dashboard stats endpoint
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
    // Get total restaurants count
    const totalRestaurants = await Restaurant.count();
    
    // Get active restaurants count
    const activeRestaurants = await Restaurant.count({
      where: { status: 'active' }
    });
    
    // Get total tables count
    const totalTables = await Table.count();
    
    // Get recent restaurants (last 5)
    const recentRestaurants = await Restaurant.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'subdomain', 'status', 'created_at']
    });
    
    res.json({
      success: true,
      totalRestaurants,
      activeRestaurants,
      totalTables,
      recentRestaurants: recentRestaurants.map(r => ({
        id: r.id,
        name: r.name,
        subdomain: r.subdomain,
        status: r.status,
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri alınırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;
