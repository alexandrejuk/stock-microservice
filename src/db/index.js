const Sequelize = require('sequelize');
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
});

const Product = sequelize.define('product', {
  name: Sequelize.STRING,
})

const StockLocation = sequelize.define('stockLocation', {
  name: Sequelize.STRING,
})

module.exports = sequelize