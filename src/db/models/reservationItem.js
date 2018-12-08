const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationItem = sequelize.define('reservationItem', {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    currentQuantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })

  ReservationItem.associate = (models) => {
    ReservationItem.belongsTo(models.individualProduct)
    ReservationItem.belongsTo(models.stockLocation)

    ReservationItem.belongsTo(models.reservation, {
      foreignKey: {
        allowNull: false,
      },
    })

    ReservationItem.belongsTo(models.product, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  return ReservationItem
}