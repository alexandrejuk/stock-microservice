const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const ReservationIndividualProduct = sequelize.define('reservationIndividualProduct', {
    available: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  })

  ReservationIndividualProduct.associate = (models) => {
    ReservationIndividualProduct.belongsTo(models.individualProduct, {
      foreignKey: {
        allowNull: false,
      },
    })

    ReservationIndividualProduct.belongsTo(models.product, {
      foreignKey: {
        allowNull: false,
      },
    })

    ReservationIndividualProduct.hasMany(models.reservationIndividualProductHistory, {
      as: 'history',
    })
  }

  return ReservationIndividualProduct
}