const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const POSDevice = sequelize.define('POSDevice', {
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
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'syncing'),
    defaultValue: 'offline'
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  todayTransactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  todayRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  battery: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  }
}, {
  tableName: 'POSDevices',
  timestamps: true
});

  return POSDevice;
};
