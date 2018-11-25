const Sequelize = require('sequelize')

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
      type: Sequelize.ENUM(['fisica', 'juridica']),
      default: 'juridica',
    },
    active: {
      type: Sequelize.BOOLEAN,
      default: true,
    }
  })

  Customer.associate = (models) => {
    models.customer.hasMany(models.document)
  }

  return Customer
}