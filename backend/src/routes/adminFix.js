const express = require('express');
const router = express.Router();
const { AdminUser } = require('../models');
const { hashPassword } = require('../lib/adminAuth');

// GET /api/admin-fix - Get info and Reset
router.get('/', async (req, res) => {
    try {
        const admin = await AdminUser.findOne();
        if (!admin) {
            return res.send('<h1>Hiç admin bulunamadı!</h1>');
        }

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Kurtarma</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6; }
                    .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd; }
                    .form-group { margin-bottom: 15px; }
                    input { padding: 10px; width: 100%; box-sizing: border-box; }
                    button { padding: 12px 20px; background: #27ae60; color: white; border: none; cursor: pointer; border-radius: 5px; font-weight: bold; }
                    .warning { color: #d35400; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>🔑 Admin Kurtarma Paneli</h1>
                
                <div class="info">
                    <h3>Mevcut Admin Bilgisi:</h3>
                    <p><strong>Username:</strong> <span style="color: blue; font-size: 1.2em;">${admin.username}</span></p>
                    <p><strong>Email:</strong> ${admin.email}</p>
                    <p><strong>Durum:</strong> ${admin.status} ${admin.isLocked() ? '(Kilitli 🔒)' : '(Açık ✅)'}</p>
                </div>

                <p class="warning">Şifreyi sıfırlamak istiyorsanız aşağıya yeni şifreyi yazın:</p>
                
                <form method="POST" action="/api/admin-fix/reset">
                    <input type="hidden" name="id" value="${admin.id}">
                    <div class="form-group">
                        <label>Yeni Şifre:</label>
                        <input type="text" name="newPassword" required placeholder="Yeni şifreyi buraya yazın">
                    </div>
                    <button type="submit">Şifreyi Güncelle ve Kilidi Aç</button>
                </form>

                <p style="margin-top: 30px; font-size: 0.8em; color: gray;">Önemli: Giriş yaparken yukarıdaki <b>Username</b> kısmını kullandığınızdan emin olun.</p>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST /api/admin-fix/reset
router.post('/reset', async (req, res) => {
    try {
        const { id, newPassword } = req.body;
        const password_hash = await hashPassword(newPassword);

        await AdminUser.update({
            password_hash,
            status: 'active',
            login_attempts: 0,
            locked_until: null
        }, {
            where: { id }
        });

        res.send(`
            <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                <h1 style="color: green;">✅ Şifre Başarıyla Güncellendi!</h1>
                <p>Şimdi giriş yapmayı deneyebilirsiniz.</p>
                <p><a href="/admin/login" style="padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">Giriş Sayfasına Dön</a></p>
            </div>
        `);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
