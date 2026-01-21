/**
 * Global Error Handler Middleware
 * Catches database schema errors and prevents system crashes
 */

const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error('Error caught by global handler:', {
        name: err.name,
        message: err.message,
        path: req.path
    });

    // Handle Sequelize database errors - missing columns
    if (err.name === 'SequelizeDatabaseError') {
        // Check if it's a missing column error
        if (err.message.includes('column') && err.message.includes('does not exist')) {
            return res.status(200).json({
                success: false,
                warning: 'Database schema needs update. Some columns are missing.',
                message: 'Please visit /debug/db-schema to fix the database schema',
                redirectTo: '/debug/db-schema',
                error: process.env.NODE_ENV === 'development' ? err.message : 'Column error detected',
                schemaUpdateRequired: true
            });
        }

        // Check if it's a missing table error
        if (err.message.includes('relation') && err.message.includes('does not exist')) {
            return res.status(200).json({
                success: false,
                warning: 'Database table missing',
                message: 'Database initialization required. Server restart may be needed.',
                error: process.env.NODE_ENV === 'development' ? err.message : 'Table error detected',
                schemaUpdateRequired: true
            });
        }

        // Other database errors
        return res.status(500).json({
            success: false,
            message: 'Database error occurred',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Database error'
        });
    }

    // Handle validation errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Handle foreign key constraint errors
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Foreign key constraint violation',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Constraint error'
        });
    }

    // Handle unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry found',
            field: err.errors?.[0]?.path || 'unknown',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Duplicate error'
        });
    }

    // Default error handler - pass to Express default handler
    if (res.headersSent) {
        return next(err);
    }

    // General error response
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
};

module.exports = errorHandler;
