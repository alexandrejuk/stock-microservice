const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Document = sequelize.define('document', {
    type: {
      type: Sequelize.ENUM(['cnpj', 'cpf', 'inscricao_estadual']),
      allowNull: false,
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  })

  Document.associate = (models) => {
    models.document.belongsTo(models.customer)
  }

  return Document
}