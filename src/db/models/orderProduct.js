const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const OrderProduct = sequelize.define('orderProduct', {
    quantity: Sequelize.INTEGER,
    unregisteredQuantity: {
      type: Sequelize.INTEGER,
      default: 0,
    },
  })

  OrderProduct.associate = (models) => {

    models.orderProduct.belongsTo(models.order)
    
    models.orderProduct.belongsTo(models.product)
  }

  return OrderProduct
}