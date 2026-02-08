const { verifyToken } = require('../lib/adminAuth');

/**
 * Middleware to verify admin JWT token and authenticate requests
 */
const adminAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        console.log('Admin auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Admin auth middleware - No Bearer token found');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Admin auth middleware - Token extracted:', token.substring(0, 20) + '...');

        // Verify token
        const decoded = verifyToken(token);
        console.log('Admin auth middleware - Token decoded:', decoded ? 'Success' : 'Failed');

        if (!decoded) {
            console.log('Admin auth middleware - Token verification failed');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        console.log('Admin auth middleware - Decoded token:', { id: decoded.id, role: decoded.role, type: decoded.type });

        // Check if token is access token (not refresh)
        if (decoded.type !== 'access') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        // super_admin veya company_admin olabilir
        if (decoded.role !== 'super_admin' && decoded.role !== 'company_admin') {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        // Check if admin user exists and is active
        const { AdminUser } = require('../models');
        const adminUser = await AdminUser.findByPk(decoded.id);

        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (adminUser.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is not active'
            });
        }

        if (adminUser.isLocked()) {
            return res.status(403).json({
                success: false,
                message: 'Account is locked'
            });
        }

        // company_admin ise company_id zorunlu
        if (adminUser.role === 'company_admin' && !adminUser.company_id) {
            return res.status(403).json({
                success: false,
                message: 'Şirket ataması eksik'
            });
        }

        // Attach user to request (company_admin için companyId ile filtre yapılacak)
        req.adminUser = {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            companyId: adminUser.companyId || adminUser.company_id || null
        };

        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

module.exports = adminAuthMiddleware;
