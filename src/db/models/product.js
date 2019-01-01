const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Product = sequelize.define('product', {
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
    },
    brand: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('brand', val.toUpperCase());
      },
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('category', val.toUpperCase());
      },
      allowNull: false,
    },
    sku: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    hasSerialNumber: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    priceBuy: {
      type: Sequelize.INTEGER,
      default: 0,
    },
    priceSell: {
      type: Sequelize.INTEGER,
      default: 0,
    },
  })
  return Product
}