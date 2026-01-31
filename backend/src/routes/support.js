const express = require('express');
const router = express.Router();
const { SupportTicket, Restaurant } = require('../models');

// GET /api/support - Get all support tickets (or filtered by restaurantId)
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const where = {};
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    const tickets = await SupportTicket.findAll({
      where,
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedTickets = tickets.map(ticket => ({
      ...ticket.toJSON(),
      restaurantName: ticket.restaurant ? ticket.restaurant.name : 'Misafir'
    }));

    res.json({
      success: true,
      data: formattedTickets
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Destek talepleri alınırken bir hata oluştu'
    });
  }
});

// POST /api/support - Create new support ticket
router.post('/', async (req, res) => {
  try {
    const { restaurantId, name, email, phone, subject, message, priority, category } = req.body;

    if (!subject || !message || !email) {
      return res.status(400).json({
        success: false,
        message: 'Konu, mesaj ve e-posta alanları zorunludur'
      });
    }

    // Map priority if needed
    let dbPriority = priority;
    if (priority === 'normal') dbPriority = 'medium';

    const ticket = await SupportTicket.create({
      restaurantId: restaurantId || null,
      name: name || 'Anonim',
      email,
      phone: phone || null,
      subject,
      message,
      status: 'pending',
      priority: dbPriority || 'medium',
      category: category || 'other'
    });

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
      message: 'Destek talebi oluşturulurken bir hata oluştu'
    });
  }
});

// PUT /api/support/:id - Update support ticket status/priority
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, response } = req.body;

    const ticket = await SupportTicket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Destek talebi bulunamadı'
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (response) {
      updates.response = response;
      updates.respondedAt = new Date();
    }

    await ticket.update(updates);

    console.log(`✅ Support ticket updated: ${id}`);

    res.json({
      success: true,
      data: ticket,
      message: 'Destek talebi güncellendi'
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Destek talebi güncellenirken bir hata oluştu'
    });
  }
});

// DELETE /api/support/:id - Delete support ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Destek talebi bulunamadı'
      });
    }

    await ticket.destroy();

    console.log(`✅ Support ticket deleted: ${id}`);

    res.json({
      success: true,
      message: 'Destek talebi silindi'
    });
  } catch (error) {
    console.error('Delete support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Destek talebi silinirken bir hata oluştu'
    });
  }
});

module.exports = router;
