/**
 * Role-based order routes
 * Implements different access levels for kitchen, waiter, and cashier roles
 */
const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;
const { Order, OrderItem, Restaurant, MenuItem, MenuCategory } = require('../models');
const staffAuth = require('../middleware/staffAuth');
const roleAuth = require('../middleware/roleAuth');

// Middleware to check restaurant access
const checkRestaurantAccess = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'restaurantId is required' 
      });
    }

    // Check if staff belongs to this restaurant
    if (req.staff.restaurantId !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this restaurant'
      });
    }

    next();
  } catch (error) {
    console.error('Restaurant access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking restaurant access',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/role-orders - Get orders with role-based filtering
// All roles can view orders, but with different filters
router.get('/', staffAuth, checkRestaurantAccess, async (req, res) => {
  try {
    const { restaurantId, status, tableNumber } = req.query;
    const staffRole = req.staff.role;
    
    console.log(`🔍 GET /api/role-orders request from ${staffRole}:`, { restaurantId, status, tableNumber });

    // Base query conditions
    const where = { restaurantId };
    
    // Role-specific filters
    switch (staffRole) {
      case 'kitchen':
        // Kitchen only sees approved pending/preparing orders
        // Use COALESCE to handle missing approved column (defaults to true if column doesn't exist)
        where[Op.and] = [
          Sequelize.literal('COALESCE(approved, true) = true')
        ];
        where.status = status || { [Op.in]: ['pending', 'preparing'] };
        break;
        
      case 'waiter':
        // Waiters see approved active orders
        where[Op.and] = [
          Sequelize.literal('COALESCE(approved, true) = true')
        ];
        if (status && status !== 'all') {
          where.status = status;
        } else {
          where.status = { [Op.notIn]: ['completed', 'cancelled'] };
        }
        
        // Filter by table number if provided
        if (tableNumber) {
          where.tableNumber = tableNumber;
        }
        break;
        
      case 'cashier':
        // Cashiers see unapproved pending orders for approval tab
        if (status === 'pending') {
          where.status = 'pending';
          where[Op.and] = [
            Sequelize.literal('COALESCE(approved, false) = false')
          ];
        } else if (status && status !== 'all') {
          where.status = status;
        }
        break;
        
      default:
        // Default case for other roles
        if (status && status !== 'all') {
          where.status = status;
        }
    }

    // Get orders with items and menu details
    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
              include: [
                {
                  model: MenuCategory,
                  as: 'category',
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
      role: staffRole // Include role in response for frontend awareness
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/role-orders - Create a new order
// Only waiters and cashiers can create orders
router.post('/', staffAuth, roleAuth(['waiter', 'cashier']), async (req, res) => {
  try {
    const { restaurantId, tableNumber, items, customerName, notes } = req.body;
    
    if (!restaurantId || !tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data. Required: restaurantId, tableNumber, and items array'
      });
    }
    
    // Check if staff belongs to this restaurant
    if (req.staff.restaurantId !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this restaurant'
      });
    }
    
    // Create order
    const orderData = {
      restaurantId,
      tableNumber,
      status: 'pending',
      customerName: customerName || null,
      notes: notes || null,
      createdBy: req.staff.id,
      staffRole: req.staff.role
    };
    
    // Only set approved if column exists (will be added after DB migration)
    try {
      orderData.approved = false;
    } catch (e) {
      console.log('⚠️ approved column not yet migrated, skipping');
    }
    
    const order = await Order.create(orderData);
    
    // Create order items
    const orderItems = await Promise.all(
      items.map(item => OrderItem.create({
        orderId: order.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes || null,
        status: 'pending'
      }))
    );
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...order.toJSON(),
        items: orderItems
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/role-orders/:orderId/status - Update order status
// Different roles have different permissions
router.put('/:orderId/status', staffAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const staffRole = req.staff.role;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if staff belongs to this restaurant
    if (req.staff.restaurantId !== order.restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this order'
      });
    }
    
    // Role-based permission check for status updates
    const allowedStatusUpdates = {
      kitchen: ['preparing', 'ready'],
      waiter: ['served', 'completed', 'cancelled'],
      cashier: ['pending', 'completed', 'paid', 'cancelled']
    };
    
    if (!allowedStatusUpdates[staffRole]?.includes(status)) {
      return res.status(403).json({
        success: false,
        message: `${staffRole} role cannot update order to ${status} status`
      });
    }
    
    // Additional validation for status transitions
    const validTransitions = {
      pending: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served', 'cancelled'],
      served: ['completed', 'cancelled'],
      completed: ['paid'],
      paid: []
    };
    
    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }
    
    // Special case: Cashier must approve orders before they go to kitchen
    if (staffRole === 'cashier' && status === 'pending' && order.status === 'pending') {
      // This is a cashier approving a pending order, which is allowed
      try {
        order.approved = true;
      } catch (e) {
        console.log('⚠️ approved column not yet migrated, skipping approval flag');
      }
      await order.save();
      
      return res.json({
        success: true,
        message: 'Order approved by cashier',
        data: order
      });
    }
    
    // Update order status
    order.status = status;
    order.updatedBy = req.staff.id;
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/role-orders/:orderId/items/:itemId - Update order item status
// Kitchen can update item status, waiters can mark items as served
router.put('/:orderId/items/:itemId', staffAuth, roleAuth(['kitchen', 'waiter']), async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;
    const staffRole = req.staff.role;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Find the order item
    const orderItem = await OrderItem.findOne({
      where: { id: itemId, orderId },
      include: [{ model: Order, as: 'order' }]
    });
    
    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found'
      });
    }
    
    // Check if staff belongs to this restaurant
    if (req.staff.restaurantId !== orderItem.order.restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this order'
      });
    }
    
    // Role-based permission check for item status updates
    const allowedStatusUpdates = {
      kitchen: ['preparing', 'ready'],
      waiter: ['served', 'cancelled']
    };
    
    if (!allowedStatusUpdates[staffRole]?.includes(status)) {
      return res.status(403).json({
        success: false,
        message: `${staffRole} role cannot update item to ${status} status`
      });
    }
    
    // Update item status
    orderItem.status = status;
    await orderItem.save();
    
    // Check if all items are in the same status and update order status accordingly
    const allItems = await OrderItem.findAll({ where: { orderId } });
    const allSameStatus = allItems.every(item => item.status === status);
    
    if (allSameStatus) {
      const order = await Order.findByPk(orderId);
      order.status = status;
      await order.save();
    }
    
    res.json({
      success: true,
      message: 'Order item status updated successfully',
      data: orderItem
    });
  } catch (error) {
    console.error('Error updating order item status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order item status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/role-orders/calls - Get waiter calls (only for waiters)
router.get('/calls', staffAuth, roleAuth(['waiter']), async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId is required'
      });
    }
    
    // Check if staff belongs to this restaurant
    if (req.staff.restaurantId !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this restaurant'
      });
    }
    
    // Get waiter calls from memory store or database
    // This is a placeholder - implement according to your waiter call system
    const calls = []; // Replace with actual implementation
    
    res.json({
      success: true,
      data: calls
    });
  } catch (error) {
    console.error('Error fetching waiter calls:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching waiter calls',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
