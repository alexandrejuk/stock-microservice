const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Reservation = sequelize.define('reservation', {
    description: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATE,
    },
    tecnicoId: {
      type: Sequelize.STRING,
    }
  })

  Reservation.associate = (models) => {
    Reservation.hasMany(models.productReservation)
  }

  return Reservation
}