const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Stock = sequelize.define('stock', {
    quantity: Sequelize.INTEGER,
  })

  Stock.associate = (models) => {

    models.stock.belongsTo(models.product, {
      constraints: false,
    })

    models.stock.belongsTo(models.stockLocation, {
      constraints: false,
    })

  }

  return Stock
}