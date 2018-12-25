const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationProduct = sequelize.define('reservationProduct', {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    currentQuantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })

  ReservationProduct.associate = (models) => {
    ReservationProduct.belongsTo(models.reservation, {
      foreignKey: {
        allowNull: false,
      },
    })

    ReservationProduct.belongsTo(models.product, {
      foreignKey: {
        allowNull: false,
      },
    })

    ReservationProduct.hasMany(models.reservationProductHistory, {
      as: 'history',
    })
  }

  return ReservationProduct
}