const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationIndividualProductHistory = sequelize.define('reservationIndividualProductHistory', {
    type: {
      type: Sequelize.ENUM(['release', 'return', 'cancel']),
      allowNull: true,
    },
  })

  return ReservationIndividualProductHistory
}

