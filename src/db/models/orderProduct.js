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

    models.orderProduct.belongsTo(models.order, {
      constraints: false,
    })
    
    models.orderProduct.belongsTo(models.product, {
      constraints: false,
    })
  }

  return OrderProduct
}