const Stock = require('./stock')
const StockLocation = require('./stockLocation')
const Product = require('./product')
const Order = require('./order')
const orderProduct = require('./orderProduct')
const individualProduct = require('./individualProduct')

module.exports = [
  Stock,
  StockLocation,
  Product,
  Order,
  orderProduct,
  individualProduct,
]