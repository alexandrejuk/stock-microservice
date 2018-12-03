const Sequelize = require('sequelize')

/**
 * Legal person = pessoa juridica
 * Natural person = pessoa fisica
 */
module.exports = (sequelize) => {
  const Customer = sequelize.define('customer', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      set(val) {
        this.setDataValue('name', val.toUpperCase());
      },
    },
    type: {
      type: Sequelize.ENUM(['legal', 'natural']),
      allowNull: false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    }
  })

  Customer.associate = (models) => {
    models.customer.hasOne(models.naturalPerson)
    models.customer.hasOne(models.legalPerson)
  }

  return Customer
}