const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationItemHistory = sequelize.define('reservationItemHistory', {
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM(['release', 'return']),
      allowNull: false,
    },
  })

  ReservationItemHistory.associate = (models) => {
    ReservationItemHistory.belongsTo(models.reservationItem)

    ReservationItemHistory.belongsToMany(
      models.reservationItemIndividualProduct,
      {
        through: 'ReservationItemHistoryProductIndividual'
      }
    )
  }

  return ReservationItemHistory
}

