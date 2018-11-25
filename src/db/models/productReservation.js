const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ProductReservation = sequelize.define('productReservation', {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    currentQuantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })

  ProductReservation.associate = (models) => {
    ProductReservation.belongsTo(models.individualProduct)
    ProductReservation.belongsTo(models.stockLocation)

    ProductReservation.belongsTo(models.reservation, {
      foreignKey: {
        allowNull: false,
      },
    })

    ProductReservation.belongsTo(models.product, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  return ProductReservation
}