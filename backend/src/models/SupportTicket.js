module.exports = (sequelize, DataTypes) => {
    const SupportTicket = sequelize.define('SupportTicket', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        restaurantId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'restaurant_id',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'in-progress', 'resolved', 'closed'),
            defaultValue: 'pending',
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
            defaultValue: 'medium',
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        response: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        respondedAt: {
            type: DataTypes.DATE,
            field: 'responded_at',
        },
    }, {
        tableName: 'support_tickets',
        underscored: true,
        timestamps: true,
    });

    return SupportTicket;
};
