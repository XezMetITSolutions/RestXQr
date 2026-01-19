const express = require('express');
const router = express.Router();
const { Restaurant } = require('../models');
const { auth } = require('../middleware/auth'); // Assuming you have an auth middleware

// Get settings for the authenticated restaurant
router.get('/', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.user.restaurantId);
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
router.put('/', auth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.user.restaurantId);
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
