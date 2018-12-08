const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Reservation = sequelize.define('reservation', {
    description: {
      type: Sequelize.STRING,
    },
    reservedAt: {
      type: Sequelize.DATE,
    },
    releasedAt: {
      type: Sequelize.DATE,
    },
    tecnicoId: {
      type: Sequelize.STRING,
    },
    originId: {
      type: Sequelize.STRING,
    },
    originType: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.ENUM(['reservado', 'liberado']),
      defaultValue: 'reservado',
    },
  })

  Reservation.associate = (models) => {
    Reservation.belongsTo(models.stockLocation)

    Reservation.hasMany(models.reservationItem, {
      as: 'items',
    })
  }

  return Reservation
}