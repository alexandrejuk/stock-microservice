const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const StockLocation = sequelize.define('stockLocation', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('name', val.toUpperCase());
      },
      allowNull: false,
    }
  })
  return StockLocation
}
