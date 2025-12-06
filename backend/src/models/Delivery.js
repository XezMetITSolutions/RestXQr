const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  restaurantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Restaurants',
      key: 'id'
    }
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  items: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'on_way', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  deliveryPerson: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estimatedTime: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Deliveries',
  timestamps: true
});

  return Delivery;
};
