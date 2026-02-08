const express = require('express');
const router = express.Router();
const { Restaurant, QRToken, MenuItem, Order, Staff, sequelize } = require('../models');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { Sequelize } = require('sequelize');

// company_admin ise sadece kendi şirketinin restoranlarını göster
function restaurantWhereForAdmin(req) {
  if (req.adminUser && req.adminUser.companyId) {
    return { companyId: req.adminUser.companyId };
  }
  return {};
}

// Dashboard stats endpoint
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
    console.log('--- ADMIN DASHBOARD STATS DEBUG ---');
    const whereRest = restaurantWhereForAdmin(req);

    // Total Restaurants - company_admin ise sadece şirket restoranları
    const totalRestaurantsCount = await Restaurant.count({ where: whereRest });
    let totalRestaurants = totalRestaurantsCount;
    if (Object.keys(whereRest).length === 0) {
      const [rawRes] = await sequelize.query('SELECT count(*) as count FROM restaurants');
      totalRestaurants = parseInt(rawRes[0].count) || totalRestaurantsCount;
    }

    // Active Restaurants
    const activeWhere = { ...whereRest, isActive: true };
    const activeRestaurants = await Restaurant.count({ where: activeWhere });

    // Total Tables (şirket restoranlarına göre)
    const restIds = (await Restaurant.findAll({ where: whereRest, attributes: ['id'] })).map(r => r.id);
    const totalTables = restIds.length
      ? (await sequelize.query(
          `SELECT COALESCE(SUM(max_tables), 0) as sum FROM restaurants WHERE id = ANY(ARRAY[:ids]::uuid[])`,
          { replacements: { ids: restIds }, type: sequelize.QueryTypes.SELECT }
        ))[0]?.sum || 0
      : 0;

    // Total Menu Items (şirket restoranlarına göre)
    const totalMenuItems = restIds.length
      ? (await sequelize.query(
          `SELECT count(*) as count FROM menu_items WHERE restaurant_id = ANY(ARRAY[:ids]::uuid[])`,
          { replacements: { ids: restIds }, type: sequelize.QueryTypes.SELECT }
        ))[0]?.count || 0
      : 0;

    // Total Orders & Revenue (şirket restoranlarına göre)
    let totalOrders = 0;
    let totalRevenue = 0;
    if (restIds.length) {
      const [ord] = await sequelize.query(
        `SELECT count(*) as count, COALESCE(SUM(COALESCE(total_amount, 0) - COALESCE(discount_amount, 0)), 0) as net FROM orders WHERE restaurant_id = ANY(ARRAY[:ids]::uuid[])`,
        { replacements: { ids: restIds }, type: sequelize.QueryTypes.SELECT }
      );
      totalOrders = parseInt(ord[0]?.count || 0);
      totalRevenue = parseFloat(ord[0]?.net || 0);
    }

    // Total Staff (şirket restoranlarına göre)
    const totalStaff = restIds.length
      ? (await sequelize.query(
          `SELECT count(*) as count FROM staff WHERE restaurant_id = ANY(ARRAY[:ids]::uuid[])`,
          { replacements: { ids: restIds }, type: sequelize.QueryTypes.SELECT }
        ))[0]?.count || 0
      : 0;

    // Get recent restaurants
    const recentRestaurants = await Restaurant.findAll({
      where: whereRest,
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

// Get all restaurants for admin (company_admin sadece kendi şirketini görür)
router.get('/restaurants', adminAuthMiddleware, async (req, res) => {
  try {
    const whereRest = restaurantWhereForAdmin(req);
    const restaurants = await Restaurant.findAll({
      where: whereRest,
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
