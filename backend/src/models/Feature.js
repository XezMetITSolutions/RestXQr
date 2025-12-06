module.exports = (sequelize, DataTypes) => {
  const Feature = sequelize.define('Feature', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('basic', 'premium', 'enterprise', 'custom'),
      defaultValue: 'basic'
    },
    icon: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'features',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['category']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return Feature;
};
