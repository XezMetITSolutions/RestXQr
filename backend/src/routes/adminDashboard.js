const express = require('express');
const router = express.Router();
const { Restaurant, QRToken, MenuItem, Order, Staff, sequelize } = require('../models');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { Sequelize } = require('sequelize');

// Dashboard stats endpoint
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
    console.log('--- ADMIN DASHBOARD STATS DEBUG ---');

    // Total Restaurants - Try both model and query
    const totalRestaurantsCount = await Restaurant.count();
    const [rawRes] = await sequelize.query('SELECT count(*) as count FROM restaurants');
    const totalRestaurants = parseInt(rawRes[0].count) || totalRestaurantsCount;

    // Active Restaurants
    const [rawActive] = await sequelize.query('SELECT count(*) as count FROM restaurants WHERE is_active = true');
    const activeRestaurants = parseInt(rawActive[0].count);

    // Total Tables
    const [rawTables] = await sequelize.query('SELECT sum(max_tables) as sum FROM restaurants');
    const totalTables = parseInt(rawTables[0].sum) || 0;

    // Total Menu Items
    const [rawMenu] = await sequelize.query('SELECT count(*) as count FROM menu_items');
    const totalMenuItems = parseInt(rawMenu[0].count);

    // Total Orders
    const [rawOrders] = await sequelize.query('SELECT count(*) as count FROM orders');
    const totalOrders = parseInt(rawOrders[0].count);

    // Total Revenue
    const [rawRev] = await sequelize.query('SELECT SUM(COALESCE(total_amount, 0) - COALESCE(discount_amount, 0)) as net FROM orders');
    const totalRevenue = parseFloat(rawRev[0].net) || 0;

    // Total Staff
    const [rawStaff] = await sequelize.query('SELECT count(*) as count FROM staff');
    const totalStaff = parseInt(rawStaff[0].count);

    // Get recent restaurants
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
      })),
      _debug: {
        raw: {
          restaurants: totalRestaurants,
          orders: totalOrders,
          staff: totalStaff
        }
      }
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
