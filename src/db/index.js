const Sequelize = require('sequelize')
const models = require('./models')
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    freezeTableName: true
  }
})

const modelInstances = models.map(model => model(sequelize))
modelInstances
  .forEach(
    modelInstance => 
      modelInstance.associate && 
      modelInstance.associate(sequelize.models)
  )
  
module.exports = sequelize