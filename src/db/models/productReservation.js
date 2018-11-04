const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ProductReservation = sequelize.define('productReservation', {
    id: {
      primaryKey: true,
      type: Sequelize.BIGINT,
      autoIncrement: true,
    },
    status: {
      type: Sequelize.ENUM(['returned', 'reserved']),
      default: 'reserved',
    }
  })

  ProductReservation.associate = (models) => {
    ProductReservation.belongsTo(models.individualProduct)

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