const Sequelize = require('sequelize')
const models = require('./models')
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DATABASE_HOST || 'localhost',
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
    freezeTableName: true,
    paranoid: true,
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