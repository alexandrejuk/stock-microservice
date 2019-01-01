const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const NaturalPerson = sequelize.define('naturalPerson', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
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