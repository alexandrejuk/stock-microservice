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
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('status', val.toUpperCase());
      }  
    }
  })

  Order.associate = (models) => {

    models.order.belongsTo(models.stockLocation)
    
    models.order.hasMany(models.orderProduct)
  }

  return Order
}