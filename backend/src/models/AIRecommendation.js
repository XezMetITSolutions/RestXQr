const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const AIRecommendation = sequelize.define('AIRecommendation', {
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
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  impact: {
    type: DataTypes.ENUM('high', 'medium', 'low'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('new', 'viewed', 'applied', 'dismissed'),
    defaultValue: 'new'
  },
  confidence: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estimatedRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'AIRecommendations',
  timestamps: true
});

  return AIRecommendation;
};
