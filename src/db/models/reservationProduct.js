const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationProduct = sequelize.define('reservationProduct', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
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
    ReservationProduct.belongsTo(models.reservation)

    ReservationProduct.belongsTo(models.individualProduct)

    ReservationProduct.belongsTo(models.product)

    ReservationProduct.hasMany(models.reservationProductHistory, {
      as: 'history',
    })
  }

  return ReservationProduct
}