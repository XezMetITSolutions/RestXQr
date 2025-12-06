const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Safe model import
let Restaurant;
try {
  const models = require('../models');
  Restaurant = models.Restaurant;
} catch (error) {
  console.error('Model import error:', error);
  Restaurant = null;
}

// In-memory storage (production'da database kullanılmalı)
let supportTickets = [];

// GET /api/support - Get all support tickets
router.get('/', async (req, res) => {
  try {
    // Restaurant bilgilerini ekle
    const ticketsWithRestaurant = await Promise.all(
      supportTickets.map(async (ticket) => {
        let restaurantName = 'Bilinmeyen Restoran';
        
        if (Restaurant && ticket.restaurantId) {
          try {
            const restaurant = await Restaurant.findByPk(ticket.restaurantId);
            if (restaurant) {
              restaurantName = restaurant.name;
            }
          } catch (err) {
            console.error('Restaurant fetch error:', err);
          }
        }
        
        return {
          ...ticket,
          restaurantName
        };
      })
    );

    res.json({
      success: true,
      data: ticketsWithRestaurant.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/support - Create new support ticket
router.post('/', async (req, res) => {
  try {
    const { restaurantId, name, email, phone, subject, message, priority } = req.body;

    if (!subject || !message || !email) {
      return res.status(400).json({
        success: false,
        message: 'Subject, message, and email are required'
      });
    }

    const ticket = {
      id: uuidv4(),
      restaurantId: restaurantId || null,
      name: name || 'Anonim',
      email,
      phone: phone || null,
      subject,
      message,
      status: 'pending',
      priority: priority || 'medium',
      createdAt: new Date().toISOString()
    };

    supportTickets.push(ticket);

    console.log(`✅ New support ticket created: ${ticket.id} - ${ticket.subject}`);

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Destek talebiniz başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/support/:id - Update support ticket status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticketIndex = supportTickets.findIndex(t => t.id === id);

    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    if (status) {
      supportTickets[ticketIndex].status = status;
    }

    console.log(`✅ Support ticket updated: ${id} - Status: ${status}`);

    res.json({
      success: true,
      data: supportTickets[ticketIndex],
      message: 'Destek talebi güncellendi'
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/support/:id - Delete support ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ticketIndex = supportTickets.findIndex(t => t.id === id);

    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    supportTickets.splice(ticketIndex, 1);

    console.log(`✅ Support ticket deleted: ${id}`);

    res.json({
      success: true,
      message: 'Destek talebi silindi'
    });
  } catch (error) {
    console.error('Delete support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
