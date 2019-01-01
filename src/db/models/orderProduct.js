const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const OrderProduct = sequelize.define('orderProduct', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
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