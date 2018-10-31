const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const StockLocation = sequelize.define('stockLocation', {
    name: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('name', val.toUpperCase());
      }  
    }
  })
  return StockLocation
}
