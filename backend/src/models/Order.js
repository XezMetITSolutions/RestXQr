module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
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
      },
      onDelete: 'CASCADE'
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'table_number'
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'customer_name'
    },
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Cashier approval required before kitchen/waiter can see'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    orderType: {
      type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
      defaultValue: 'dine_in',
      field: 'order_type'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'paid_amount'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'discount_amount'
    },
    isTest: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_test',
      comment: 'Test siparisi mi?'
    },
    discountReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'discount_reason'
    },
    cashierNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cashier_note'
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['restaurant_id']
      },
      {
        fields: ['restaurant_id', 'status']
      },
      {
        fields: ['restaurant_id', 'table_number']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Order;
};
