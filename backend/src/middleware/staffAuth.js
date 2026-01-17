/**
 * Staff authentication middleware
 * Verifies staff credentials and attaches staff object to request
 */

const jwt = require('jsonwebtoken');
const { Staff, Restaurant } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const staffAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Allow restaurant owner tokens
    if (decoded.type === 'restaurant' || decoded.role === 'restaurant_owner') {
      const restaurant = await Restaurant.findByPk(decoded.id);
      if (!restaurant) {
        return res.status(401).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      req.restaurant = restaurant;
      req.staff = {
        id: restaurant.id,
        role: 'restaurant_owner',
        restaurantId: restaurant.id,
        status: 'active'
      };
      return next();
    }

    // Find staff by ID
    const staff = await Staff.findByPk(decoded.id);
    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Check if staff is active
    if (staff.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Staff account is not active'
      });
    }

    // Attach staff to request
    req.staff = staff;
    next();
  } catch (error) {
    console.error('Staff auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = staffAuth;
