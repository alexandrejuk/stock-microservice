const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const OrderProduct = sequelize.define('orderProduct', {
    quantity: Sequelize.INTEGER,
  })

  return OrderProduct
}