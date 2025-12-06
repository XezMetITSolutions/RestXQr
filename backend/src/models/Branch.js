const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manager: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  openingHours: {
    type: DataTypes.STRING,
    allowNull: true
  },
  employeeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  monthlyRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'Branches',
  timestamps: true
});

  return Branch;
};
