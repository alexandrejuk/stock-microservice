const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const LegalPerson = sequelize.define('legalPerson', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    legalName: {
      type: Sequelize.STRING,
      allowNull: false,
      set(val) {
        this.setDataValue('legalName', val.toUpperCase());
      },
    },
    inscricaoEstadual: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  })

  LegalPerson.associate = (models) => {
    models.legalPerson.belongsTo(models.customer)
  }

  return LegalPerson
}