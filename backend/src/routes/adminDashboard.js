const express = require('express');
const router = express.Router();
const { Restaurant, QRToken } = require('../models');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Dashboard stats endpoint
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
    console.log('Dashboard stats requested');
    
    // Get total restaurants count
    const totalRestaurants = await Restaurant.count();
    console.log('Total restaurants:', totalRestaurants);
    
    // Get active restaurants count (using isActive field)
    const activeRestaurants = await Restaurant.count({
      where: { isActive: true }
    });
    console.log('Active restaurants:', activeRestaurants);
    
    // Get total tables count (unique table numbers from QRTokens)
    const totalTables = await QRToken.count({
      distinct: true,
      col: 'tableNumber'
    });
    console.log('Total tables:', totalTables);
    
    // Get recent restaurants (last 5)
    const recentRestaurants = await Restaurant.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'subdomain', 'isActive', 'created_at']
    });
    console.log('Recent restaurants:', recentRestaurants.length);
    
    res.json({
      success: true,
      totalRestaurants,
      activeRestaurants,
      totalTables,
      recentRestaurants: recentRestaurants.map(r => ({
        id: r.id,
        name: r.name,
        subdomain: r.subdomain,
        status: r.isActive ? 'active' : 'inactive',
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

// Get all restaurants for admin
router.get('/restaurants', adminAuthMiddleware, async (req, res) => {
  try {
    console.log('Admin restaurants list requested');
    
    const restaurants = await Restaurant.findAll({
      order: [['created_at', 'DESC']],
      attributes: [
        'id', 
        'name', 
        'username', 
        'email', 
        'phone', 
        'subscriptionPlan', 
        'maxTables', 
        'maxMenuItems', 
        'maxStaff', 
        'isActive',
        'created_at'
      ]
    });
    
    console.log(`Found ${restaurants.length} restaurants`);
    
    res.json({
      success: true,
      data: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        username: r.username,
        email: r.email,
        phone: r.phone,
        subscriptionPlan: r.subscriptionPlan,
        maxTables: r.maxTables,
        maxMenuItems: r.maxMenuItems,
        maxStaff: r.maxStaff,
        isActive: r.isActive,
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('Admin restaurants list error:', error);
    res.status(500).json({
      success: false,
      message: 'Restoranlar alınırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;
