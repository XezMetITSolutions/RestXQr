module.exports = (sequelize, DataTypes) => {
  const QRToken = sequelize.define('QRToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'table_number'
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'session_id',
      comment: 'Active customer session using this QR'
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'used_at'
    },
    createdBy: {
      type: DataTypes.STRING(50),
      defaultValue: 'system',
      field: 'created_by',
      comment: 'waiter, system, admin'
    }
  }, {
    tableName: 'qr_tokens',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['token']
      },
      {
        fields: ['restaurant_id', 'table_number']
      },
      {
        fields: ['expires_at']
      }
    ]
  });

  // Model associations will be set up in the sync process
  QRToken.associate = (models) => {
    QRToken.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'Restaurant'
    });
  };

  return QRToken;
};

