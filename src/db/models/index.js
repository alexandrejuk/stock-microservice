const Stock = require('./stock')
const StockLocation = require('./stockLocation')
const Product = require('./product')
const Order = require('./order')
const orderProduct = require('./orderProduct')
const individualProduct = require('./individualProduct')
const reservation = require('./reservation')
const productReservation = require('./productReservation')
const customer = require('./customer')
const legalPerson = require('./legalPerson')
const naturalPerson = require('./naturalPerson')

module.exports = [
  Stock,
  StockLocation,
  Product,
  Order,
  orderProduct,
  individualProduct,
  reservation,
  productReservation,
  customer,
  legalPerson,
  naturalPerson,
]