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
    status: {
      type: Sequelize.ENUM(['available', 'reserved']),
      default: 'available',
    }
  })

  IndividualProduct.associate = (models) => {
    models.individualProduct.belongsTo(models.product, {
      constraints: false,
    })
  }

  return IndividualProduct
}