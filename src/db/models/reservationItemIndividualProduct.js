const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationItemIndividualProduct = sequelize.define('reservationItemIndividualProduct', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    available: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  })

  ReservationItemIndividualProduct.associate = (models) => {
    ReservationItemIndividualProduct.belongsTo(models.reservationItem)
    ReservationItemIndividualProduct.belongsTo(models.individualProduct)
  }

  return ReservationItemIndividualProduct
}