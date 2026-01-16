const { verifyToken } = require('../lib/adminAuth');

/**
 * Middleware to verify admin JWT token and authenticate requests
 */
const adminAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Check if token is access token (not refresh)
        if (decoded.type !== 'access') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        // Check if user has super_admin role
        if (decoded.role !== 'super_admin') {
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

        // Attach user to request
        req.adminUser = {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role
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
