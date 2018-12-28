const Stock = require('./stock')
const StockLocation = require('./stockLocation')
const Product = require('./product')
const individualProduct = require('./individualProduct')

/** Customer Models */
const customer = require('./customer')
const legalPerson = require('./legalPerson')
const naturalPerson = require('./naturalPerson')

/** Order Models */
const Order = require('./order')
const orderProduct = require('./orderProduct')

/** Reservation Models */
const reservation = require('./reservation')
const reservationProduct = require('./reservationProduct')
const reservationProductHistory = require('./reservationProductHistory')

module.exports = [
  Stock,
  StockLocation,
  Product,
  Order,
  orderProduct,
  individualProduct,
  customer,
  legalPerson,
  naturalPerson,
  reservation,
  reservationProduct,
  reservationProductHistory,
]