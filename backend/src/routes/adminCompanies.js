const express = require('express');
const router = express.Router();
const { Company, Restaurant, AdminUser } = require('../models');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { hashPassword } = require('../lib/adminAuth');

// Sadece super_admin erişebilir
function requireSuperAdmin(req, res, next) {
  if (req.adminUser && req.adminUser.role === 'super_admin') return next();
  return res.status(403).json({ success: false, message: 'Sadece süper admin bu işlemi yapabilir' });
}

// GET /api/admin/companies - Tüm şirketleri listele (super_admin)
router.get('/', adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['name', 'ASC']],
      include: [{ model: Restaurant, as: 'restaurants', attributes: ['id', 'name', 'username'] }]
    });
    res.json({
      success: true,
      data: companies.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        restaurantCount: (c.restaurants || []).length,
        restaurants: (c.restaurants || []).map(r => ({ id: r.id, name: r.name, username: r.username }))
      }))
    });
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({ success: false, message: 'Şirketler listelenirken hata oluştu', error: error.message });
  }
});

// POST /api/admin/companies - Yeni şirket oluştur (super_admin)
router.post('/', adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Şirket adı gerekli' });
    }
    const company = await Company.create({ name: name.trim(), description: description || null });
    res.status(201).json({ success: true, data: { id: company.id, name: company.name, description: company.description } });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ success: false, message: 'Şirket oluşturulurken hata oluştu', error: error.message });
  }
});

// PATCH /api/admin/companies/:id - Şirket güncelle (super_admin)
router.patch('/:id', adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Şirket bulunamadı' });
    const { name, description } = req.body;
    if (name !== undefined) company.name = name.trim();
    if (description !== undefined) company.description = description;
    await company.save();
    res.json({ success: true, data: { id: company.id, name: company.name, description: company.description } });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ success: false, message: 'Şirket güncellenirken hata oluştu', error: error.message });
  }
});

// POST /api/admin/companies/:id/restaurants - Şirkete restoran ata (super_admin)
// Body: { restaurantIds: [uuid, ...] }
router.post('/:id/restaurants', adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Şirket bulunamadı' });
    const { restaurantIds } = req.body;
    if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return res.status(400).json({ success: false, message: 'En az bir restoran ID gerekli' });
    }
    await Restaurant.update(
      { companyId: company.id },
      { where: { id: restaurantIds } }
    );
    const updated = await Restaurant.findAll({ where: { companyId: company.id }, attributes: ['id', 'name', 'username'] });
    res.json({ success: true, data: { assigned: restaurantIds.length, restaurants: updated } });
  } catch (error) {
    console.error('Assign restaurants error:', error);
    res.status(500).json({ success: false, message: 'Restoran atanırken hata oluştu', error: error.message });
  }
});

// DELETE /api/admin/companies/:id/restaurants/:restaurantId - Restoranı şirketten çıkar (super_admin)
router.delete('/:id/restaurants/:restaurantId', adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const r = await Restaurant.findByPk(req.params.restaurantId);
    if (!r) return res.status(404).json({ success: false, message: 'Restoran bulunamadı' });
    if (r.companyId !== req.params.id) {
      return res.status(400).json({ success: false, message: 'Bu restoran bu şirkete ait değil' });
    }
    await r.update({ companyId: null });
    res.json({ success: true, message: 'Restoran şirketten çıkarıldı' });
  } catch (error) {
    console.error('Unassign restaurant error:', error);
    res.status(500).json({ success: false, message: 'İşlem başarısız', error: error.message });
  }
});

// GET /api/admin/companies/options - Şirket listesi (dropdown için, super_admin)
router.get('/options', adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const companies = await Company.findAll({ order: [['name', 'ASC']], attributes: ['id', 'name'] });
    res.json({ success: true, data: companies.map(c => ({ id: c.id, name: c.name })) });
  } catch (error) {
    console.error('Companies options error:', error);
    res.status(500).json({ success: false, message: 'Şirketler alınamadı', error: error.message });
  }
});

// POST /api/admin/companies/:id/admins - Şirket yöneticisi (company_admin) oluştur (super_admin)
// Body: { username, email, name, password }
router.post('/:id/admins', adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Şirket bulunamadı' });
    const { username, email, name, password } = req.body;
    if (!username || !email || !name || !password) {
      return res.status(400).json({ success: false, message: 'Kullanıcı adı, email, ad ve şifre gerekli' });
    }
    const existing = await AdminUser.findOne({ where: require('sequelize').Op.or([{ username }, { email }]) });
    if (existing) return res.status(400).json({ success: false, message: 'Bu kullanıcı adı veya email zaten kullanılıyor' });
    const password_hash = await hashPassword(password);
    const admin = await AdminUser.create({
      username: username.trim(),
      email: email.trim(),
      name: name.trim(),
      password_hash,
      role: 'company_admin',
      companyId: company.id,
      status: 'active'
    });
    res.status(201).json({
      success: true,
      data: { id: admin.id, username: admin.username, email: admin.email, name: admin.name, role: 'company_admin', companyId: company.id }
    });
  } catch (error) {
    console.error('Create company admin error:', error);
    res.status(500).json({ success: false, message: 'Şirket yöneticisi oluşturulurken hata oluştu', error: error.message });
  }
});

module.exports = router;
