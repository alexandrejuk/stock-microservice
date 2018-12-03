const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const LegalPerson = sequelize.define('legalPerson', {
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
    cnpj: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  LegalPerson.associate = (models) => {
    models.legalPerson.belongsTo(models.customer)
  }

  return LegalPerson
}