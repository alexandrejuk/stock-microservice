const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const Product = sequelize.define('product', {
    name: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('name', val.toUpperCase());
      }  
    },
    brand: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('brand', val.toUpperCase());
      }  
    },
    category: {
      type: Sequelize.STRING,
      set(val) {
        this.setDataValue('category', val.toUpperCase());
      }  
    },
    sku: {
      type: Sequelize.STRING 
    },
    hasSerialNumber: {
      type: Sequelize.BOOLEAN 
    },
    priceBuy: {
      type: Sequelize.INTEGER 
    },
    priceSell: {
      type: Sequelize.INTEGER 
    },
  })
  return Product
}