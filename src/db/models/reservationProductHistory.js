const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationProductHistory = sequelize.define('reservationProductHistory', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    type: {
      type: Sequelize.ENUM(['release', 'return', 'cancel']),
      allowNull: true,
    },
  })

  ReservationProductHistory.associate = (models) => {

    ReservationProductHistory.belongsTo(models.reservationProduct)
  }

  return ReservationProductHistory
}

