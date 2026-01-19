const express = require('express');
const router = express.Router();
const { Restaurant } = require('../models');
const staffAuth = require('../middleware/staffAuth');

// Get settings for the authenticated restaurant
router.get('/', staffAuth, async (req, res) => {
    try {
        const restaurantId = req.staff?.restaurantId || req.restaurant?.id;
        if (!restaurantId) {
            return res.status(401).json({ success: false, message: 'Restaurant ID not found' });
        }

        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Return the settings, defaulting to an empty object if null
        res.json({ success: true, data: restaurant.settings || {} });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update settings for the authenticated restaurant
router.put('/', staffAuth, async (req, res) => {
    try {
        const restaurantId = req.staff?.restaurantId || req.restaurant?.id;
        if (!restaurantId) {
            return res.status(401).json({ success: false, message: 'Restaurant ID not found' });
        }

        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Merge existing settings with new updates
        const currentSettings = restaurant.settings || {};
        const newSettings = { ...currentSettings, ...req.body };

        restaurant.settings = newSettings;
        await restaurant.save();

        res.json({ success: true, data: restaurant.settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
