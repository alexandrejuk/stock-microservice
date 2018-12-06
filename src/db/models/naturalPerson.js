const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const NaturalPerson = sequelize.define('naturalPerson', {
    nickName: {
      type: Sequelize.STRING,
      allowNull: true,
      set(val) {
        this.setDataValue('nickName', val.toUpperCase());
      },
    },
  })

  NaturalPerson.associate = (models) => {
    models.naturalPerson.belongsTo(models.customer)
  }

  return NaturalPerson
}