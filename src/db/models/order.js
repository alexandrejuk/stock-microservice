const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Order = sequelize.define('order', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    description: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('description', val.toUpperCase());
      }  
    },
    reason: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('reason', val.toUpperCase());
      }  
    },
    status: {
      type: Sequelize.ENUM(['CANCELLED', 'REGISTERED']),
      defaultValue: 'REGISTERED',
    }
  })

  Order.associate = (models) => {

    models.order.belongsTo(models.stockLocation)
    models.order.hasMany(models.orderProduct)
    models.order.hasMany(models.stock, {
      constraints: false,
      foreignKey: 'originId',
      scope: {
        originType: 'order',
      }
    })
  }

  return Order
}