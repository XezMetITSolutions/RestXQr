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
    references: {
      model: 'restaurants',
      key: 'id'
    }
  },
  tableNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Active customer session using this QR'
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.STRING(50),
    defaultValue: 'system',
    comment: 'waiter, system, admin'
  }
}, {
  tableName: 'qr_tokens',
  timestamps: true,
  underscored: true,
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

