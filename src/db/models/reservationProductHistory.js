const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationProductHistory = sequelize.define('reservationProductHistory', {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    type: {
      type: Sequelize.ENUM(['release', 'return', 'cancel']),
      allowNull: true,
    },
  })

  return ReservationProductHistory
}

