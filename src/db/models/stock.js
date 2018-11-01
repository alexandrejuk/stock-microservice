const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Stock = sequelize.define('stock', {
    quantity: Sequelize.INTEGER,
  })

  Stock.associate = (models) => {

    models.stock.belongsTo(models.product)

    models.stock.belongsTo(models.stockLocation)

  }

  return Stock
}