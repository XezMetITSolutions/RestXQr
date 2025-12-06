const express = require('express');
const router = express.Router();

// Safe model import
let Restaurant;
try {
  const models = require('../models');
  Restaurant = models.Restaurant;
} catch (error) {
  console.error('Model import error:', error);
  Restaurant = null;
}

// Plan limitleri tanımı
const PLAN_LIMITS = {
  basic: {
    name: 'Basic',
    price: 2980,
    maxTables: 10,
    maxMenuItems: 50,
    maxStaff: 3
  },
  premium: {
    name: 'Premium',
    price: 4980,
    maxTables: 25,
    maxMenuItems: 150,
    maxStaff: 10
  },
  enterprise: {
    name: 'Enterprise',
    price: 9980,
    maxTables: 999,
    maxMenuItems: 999,
    maxStaff: 999
  }
};

// GET /api/plans - Get all plans
router.get('/', async (req, res) => {
  try {
    // Plan bilgilerini döndür
    const plans = Object.keys(PLAN_LIMITS).map(key => ({
      id: key,
      name: key,
      displayName: PLAN_LIMITS[key].name,
      price: PLAN_LIMITS[key].price,
      maxTables: PLAN_LIMITS[key].maxTables,
      maxMenuItems: PLAN_LIMITS[key].maxMenuItems,
      maxStaff: PLAN_LIMITS[key].maxStaff,
      isActive: true
    }));

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/plans/:planId - Update plan limits
router.put('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const { maxTables, maxMenuItems, maxStaff, price } = req.body;

    console.log(`📝 Updating plan ${planId}:`, { maxTables, maxMenuItems, maxStaff, price });

    if (!PLAN_LIMITS[planId]) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Plan limitlerini güncelle
    if (maxTables !== undefined) PLAN_LIMITS[planId].maxTables = maxTables;
    if (maxMenuItems !== undefined) PLAN_LIMITS[planId].maxMenuItems = maxMenuItems;
    if (maxStaff !== undefined) PLAN_LIMITS[planId].maxStaff = maxStaff;
    if (price !== undefined) PLAN_LIMITS[planId].price = price;

    console.log(`✅ Plan ${planId} updated:`, PLAN_LIMITS[planId]);

    // Bu planı kullanan tüm restoranların limitlerini güncelle
    if (Restaurant) {
      const updateData = {};
      if (maxTables !== undefined) updateData.maxTables = maxTables;
      if (maxMenuItems !== undefined) updateData.maxMenuItems = maxMenuItems;
      if (maxStaff !== undefined) updateData.maxStaff = maxStaff;

      const [updatedCount] = await Restaurant.update(
        updateData,
        {
          where: { subscriptionPlan: planId }
        }
      );

      console.log(`🔄 Updated ${updatedCount} restaurants with plan ${planId}`);

      res.json({
        success: true,
        message: `Plan updated successfully. ${updatedCount} restaurants updated.`,
        data: {
          id: planId,
          name: planId,
          displayName: PLAN_LIMITS[planId].name,
          price: PLAN_LIMITS[planId].price,
          maxTables: PLAN_LIMITS[planId].maxTables,
          maxMenuItems: PLAN_LIMITS[planId].maxMenuItems,
          maxStaff: PLAN_LIMITS[planId].maxStaff
        },
        updatedRestaurants: updatedCount
      });
    } else {
      res.json({
        success: true,
        message: 'Plan updated successfully (Restaurant model not available)',
        data: {
          id: planId,
          name: planId,
          displayName: PLAN_LIMITS[planId].name,
          price: PLAN_LIMITS[planId].price,
          maxTables: PLAN_LIMITS[planId].maxTables,
          maxMenuItems: PLAN_LIMITS[planId].maxMenuItems,
          maxStaff: PLAN_LIMITS[planId].maxStaff
        }
      });
    }
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/plans/:planId/restaurants - Get restaurants using this plan
router.get('/:planId/restaurants', async (req, res) => {
  try {
    const { planId } = req.params;

    if (!Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Restaurant model not available'
      });
    }

    const restaurants = await Restaurant.findAll({
      where: { subscriptionPlan: planId },
      attributes: ['id', 'name', 'username', 'email', 'maxTables', 'maxMenuItems', 'maxStaff']
    });

    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (error) {
    console.error('Get plan restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
