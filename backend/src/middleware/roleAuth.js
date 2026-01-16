/**
 * Role-based authorization middleware
 * Checks if the authenticated staff has the required role(s) to access a route
 */

const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    // Skip role check if no roles specified
    if (!allowedRoles || allowedRoles.length === 0) {
      return next();
    }

    // Check if staff is authenticated
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Authentication required'
      });
    }

    // Check if staff role is in allowed roles
    if (!allowedRoles.includes(req.staff.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied - Required role: ${allowedRoles.join(' or ')}`
      });
    }

    // Staff has required role, proceed
    next();
  };
};

module.exports = roleAuth;
