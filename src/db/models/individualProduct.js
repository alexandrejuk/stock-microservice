const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const IndividualProduct = sequelize.define('individualProduct', {
    serialNumber: {
      type: Sequelize.STRING,
      unique: 'product_serial',
    },
    productId: {
      type: Sequelize.INTEGER,
      unique: 'product_serial',
    },
    originId: {
      type: Sequelize.INTEGER,
    },
    originType: {
      type: Sequelize.STRING,
    },
    available: {
      type: Sequelize.BOOLEAN,
      default: true,
    }
  })

  IndividualProduct.associate = (models) => {
    models.individualProduct.belongsTo(models.product, {
      constraints: false,
    })

    models.individualProduct.belongsTo(models.customer, {
      constraints: false,
    })

    models.individualProduct.belongsTo(models.stockLocation, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  return IndividualProduct
}