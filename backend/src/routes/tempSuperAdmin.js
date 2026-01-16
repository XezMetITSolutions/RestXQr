const express = require('express');
const router = express.Router();
const { AdminUser } = require('../models');
const { hashPassword } = require('../lib/adminAuth');

// GET /temp-admin - Show form
router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Acil Durum Superadmin Oluşturucu</title>
            <style>
                body { font-family: sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; }
                input { width: 100%; padding: 8px; box-sizing: border-box; }
                button { padding: 10px 20px; background: #c0392b; color: white; border: none; cursor: pointer; }
                .success { color: green; background: #e8f5e9; padding: 10px; margin-bottom: 20px; }
                .error { color: red; background: #ffebee; padding: 10px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>⚠️ Geçici Superadmin Oluşturma</h1>
            <p>Bu sayfa acil durumlar içindir. İşiniz bitince lütfen silin.</p>
            
            <form method="POST" action="/api/temp-admin/create">
                <div class="form-group">
                    <label>Kullanıcı Adı:</label>
                    <input type="text" name="username" required placeholder="ornek: aciladmin">
                </div>
                
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" required placeholder="ornek: admin@test.com">
                </div>

                <div class="form-group">
                    <label>Ad Soyad:</label>
                    <input type="text" name="name" required placeholder="Süper Admin">
                </div>

                <div class="form-group">
                    <label>Yeni Şifre:</label>
                    <input type="text" name="password" required minlength="6" placeholder="En az 6 karakter">
                </div>

                <button type="submit">Oluştur</button>
            </form>
        </body>
        </html>
    `);
});

// POST /temp-admin/create - Create user
router.post('/create', async (req, res) => {
    try {
        const { username, email, name, password } = req.body;

        if (!username || !email || !name || !password) {
            return res.send('<h1 style="color:red">Eksik alanlar var!</h1><a href="/api/temp-admin">Geri Dön</a>');
        }

        const password_hash = await hashPassword(password);

        const adminUser = await AdminUser.create({
            username,
            email,
            name,
            password_hash,
            role: 'super_admin',
            status: 'active',
            two_factor_enabled: false
        });

        res.send(`
            <div style="font-family: sans-serif; padding: 20px; background: #e8f5e9; border: 1px solid green;">
                <h1 style="color: green;">✅ Başarılı!</h1>
                <p>Yeni superadmin oluşturuldu.</p>
                <ul>
                    <li><strong>Kullanıcı Adı:</strong> ${username}</li>
                    <li><strong>Şifre:</strong> ${password}</li>
                </ul>
                <p><a href="/admin/login">Admin Paneline Git</a></p>
                <p style="color: red; margin-top: 20px;">⚠️ Lütfen şimdi bu dosyayı silin veya devredışı bırakın.</p>
            </div>
        `);

    } catch (error) {
        console.error('Temp admin creation error:', error);
        res.send(`
            <h1 style="color:red">Hata Oluştu!</h1>
            <pre>${error.message}</pre>
            <a href="/api/temp-admin">Geri Dön</a>
        `);
    }
});

module.exports = router;
