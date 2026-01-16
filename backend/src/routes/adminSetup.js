const express = require('express');
const router = express.Router();
const { AdminUser } = require('../models');
const { hashPassword } = require('../lib/adminAuth');

// POST /api/admin/setup/create-first-admin - İlk superadmin oluştur
router.post('/create-first-admin', async (req, res) => {
    try {
        const { username, email, name, password } = req.body;

        // Validation
        if (!username || !email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tüm alanlar gereklidir'
            });
        }

        // Check if any admin already exists
        const existingAdmin = await AdminUser.findOne();

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Sistemde zaten bir admin mevcut. Bu endpoint sadece ilk kurulum için kullanılabilir.'
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir email adresi giriniz'
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az 8 karakter olmalıdır'
            });
        }

        // Hash password
        const password_hash = await hashPassword(password);

        // Create first admin
        const adminUser = await AdminUser.create({
            username,
            email,
            name,
            password_hash,
            role: 'super_admin',
            status: 'active',
            two_factor_enabled: false
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: adminUser.id,
                    username: adminUser.username,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role,
                    status: adminUser.status
                }
            },
            message: 'İlk superadmin başarıyla oluşturuldu!'
        });

    } catch (error) {
        console.error('Create first admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Superadmin oluşturma hatası',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/admin/setup/check - Admin var mı kontrol et
router.get('/check', async (req, res) => {
    try {
        const adminCount = await AdminUser.count();

        res.json({
            success: true,
            data: {
                hasAdmin: adminCount > 0,
                adminCount: adminCount
            }
        });
    } catch (error) {
        console.error('Setup check error:', error);

        // Self-healing: If table doesn't exist, create it and retry
        if (error.original && error.original.code === '42P01') { // Postgres code for undefined_table
            try {
                console.log('⚠️ Admin table missing, attempting to auto-create...');
                await AdminUser.sync({ alter: true });
                console.log('✅ Admin table created successfully');

                const adminCount = await AdminUser.count();
                return res.json({
                    success: true,
                    data: {
                        hasAdmin: adminCount > 0,
                        adminCount: adminCount
                    },
                    message: 'Database initialized automatically'
                });
            } catch (syncError) {
                console.error('Auto-creation failed:', syncError);
                // Fall through to error response
            }
        }

        res.status(500).json({
            success: false,
            message: 'Kontrol hatası: ' + error.message,
            stack: error.stack
        });
    }
});

// POST /api/admin/setup/sync-db - Force sync database
router.post('/sync-db', async (req, res) => {
    try {
        const { sequelize } = require('../models');
        console.log('🔄 Manual database sync requested (light mode)...');

        // Önce kritik tablonun (AdminUser) senkronize olduğundan emin olalım
        // Bu, diğer tablolar patlasa bile admin panelinin çalışmasını sağlar
        try {
            await AdminUser.sync();
            console.log('✅ AdminUser table synced successfully');
        } catch (adminSyncError) {
            console.error('⚠️ AdminUser specific sync failed:', adminSyncError);
        }

        // Genel sync denemesi
        await sequelize.sync();

        console.log('✅ Manual database sync completed');

        res.json({
            success: true,
            message: 'Veritabanı tabloları kontrol edildi (Light Sync). Eksik tablolar oluşturuldu.'
        });
    } catch (error) {
        console.error('Manual sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Sync hatası: ' + error.message,
            stack: error.stack
        });
    }
});

// POST /api/admin/setup/reset-db - HARD RESET (Data Loss)
router.post('/reset-db', async (req, res) => {
    try {
        const { sequelize } = require('../models');
        console.log('☢️ HARD DATABASE RESET REQUESTED (RAW SQL)...');

        // 1. Raw SQL ile şemayı tamamen sil ve yeniden oluştur (En temiz yöntem)
        console.log('🔥 Dropping schema...');
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;');
        console.log('✅ Schema dropped and recreated.');

        // 2. Tabloları yeniden oluştur (Sync)
        console.log('🏗️ Rebuilding tables...');
        await sequelize.sync();
        console.log('✅ Tables rebuilt.');

        res.json({
            success: true,
            message: 'Veritabanı "Nuclear Option" ile sıfırlandı. Tüm tablolar yeniden oluşturuldu.'
        });
    } catch (error) {
        console.error('Hard reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Reset hatası: ' + error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
