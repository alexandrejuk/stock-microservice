const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const IndividualProduct = sequelize.define('individualProduct', {
    serialNumber: {
      type: Sequelize.STRING,
      unique: 'product_serial',
    },
    productId: {
      type: Sequelize.STRING,
      unique: 'product_serial',
    },
    originId: {
      type: Sequelize.INTEGER,
    },
    originType: {
      type: Sequelize.STRING,
    }
  })

  IndividualProduct.associate = (models) => {
    models.individualProduct.belongsTo(models.product, {
      constraints: false,
    })
  }

  return IndividualProduct
}