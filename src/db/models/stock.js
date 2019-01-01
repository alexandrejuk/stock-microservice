const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Stock = sequelize.define('stock', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    originId: Sequelize.UUID,
    originType: Sequelize.STRING,
    description: Sequelize.STRING,
  })

  Stock.associate = (models) => {

    models.stock.belongsTo(models.product, {
      foreignKey: {
        allowNull: false,
      }
    })

    models.stock.belongsTo(models.stockLocation, {
      foreignKey: {
        allowNull: false,
      }
    })

  }

  return Stock
}