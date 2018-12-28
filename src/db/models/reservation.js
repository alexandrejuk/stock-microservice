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
    originId: {
      type: Sequelize.STRING,
    },
    employeeId: {
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
    Reservation.belongsTo(models.customer)

    Reservation.hasMany(models.reservationProduct, {
      as: 'products',
    })
  }

  return Reservation
}