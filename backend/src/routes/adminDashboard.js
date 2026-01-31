const express = require('express');
const router = express.Router();
const { Restaurant, QRToken, MenuItem, Order, Staff } = require('../models');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { Sequelize } = require('sequelize');

// Dashboard stats endpoint
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
    console.log('Dashboard stats requested');

    // Get total restaurants count
    const totalRestaurants = await Restaurant.count();

    // Get active restaurants count
    const activeRestaurants = await Restaurant.count({
      where: { isActive: true }
    });

    // Total Tables (Sum of maxTables across all restaurants)
    const totalTablesResult = await Restaurant.sum('maxTables');
    const totalTables = totalTablesResult || 0;

    // Total Menu Items (across all restaurants)
    const totalMenuItems = await MenuItem.count();

    // Total Orders (all time, all restaurants)
    const totalOrders = await Order.count();

    // Total Revenue (all time, all restaurants - subtracting discounts if possible)
    const totalRevenueResult = await Order.findAll({
      attributes: [
        [Sequelize.literal('SUM(CASE WHEN total_amount IS NOT NULL THEN total_amount ELSE 0 END) - SUM(CASE WHEN discount_amount IS NOT NULL THEN discount_amount ELSE 0 END)'), 'netRevenue']
      ],
      raw: true
    });
    const totalRevenue = parseFloat(totalRevenueResult[0]?.netRevenue || 0);

    // Total Staff (across all restaurants)
    const totalStaff = await Staff.count();

    // Get recent restaurants (last 5)
    const recentRestaurants = await Restaurant.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'subdomain', 'isActive', 'created_at']
    });

    res.json({
      success: true,
      totalRestaurants,
      activeRestaurants,
      totalTables,
      totalMenuItems,
      totalOrders,
      totalRevenue,
      totalStaff,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders) : 0,
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
