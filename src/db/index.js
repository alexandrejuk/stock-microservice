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
  name: {
    type: Sequelize.STRING,
    set(val) {
      this.setDataValue('name', val.toUpperCase());
    }  
  }
})

const StockLocation = sequelize.define('stockLocation', {
  name: {
    type: Sequelize.STRING,
    set(val) {
      this.setDataValue('name', val.toUpperCase());
    }  
  }
})

const Stock = sequelize.define('stock', {
  quantity: Sequelize.INTEGER,
})

Stock.belongsTo(Product, {
  constraints: false,
})

Stock.belongsTo(StockLocation, {
  constraints: false,
})

module.exports = sequelize