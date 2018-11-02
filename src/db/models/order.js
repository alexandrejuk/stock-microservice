const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Order = sequelize.define('order', {
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
      type: Sequelize.ENUM(['CANCELLED', 'REGISTERED'])
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