const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const IndividualProduct = sequelize.define('individualProduct', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    serialNumber: {
      type: Sequelize.STRING,
      unique: 'product_serial',
      allowNull: false,
    },
    productId: {
      type: Sequelize.UUID,
      unique: 'product_serial',
      allowNull: false,
    },
    originId: {
      type: Sequelize.UUID,
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
      foreignKey: {
        allowNull: false,
      },
    })

    models.individualProduct.belongsTo(models.customer)

    models.individualProduct.belongsTo(models.stockLocation, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  return IndividualProduct
}