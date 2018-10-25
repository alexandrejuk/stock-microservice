const test = require('ava')
const Stock = require('./')
const { StockLocationDomain, ProductDomain } = require('../')

const databaseHelper = require('../../helpers/database')

test.before(databaseHelper.isDatabaseConnected)

test.beforeEach(async t => {
  const stockLocationDomain = new StockLocationDomain()
  const productDomain = new ProductDomain()

  const stockLocationData = { name: 'amazon' }
  const stockLocation = await stockLocationDomain.add(stockLocationData)

  const productData = { name: 'amazon' }
  const product = await productDomain.add(productData)

  t.context = {}
  t.context.stockLocationId = stockLocation.id 
  t.context.productId = product.id
})

test('Should be a stock instance', t => {
  const stockDomain = new Stock()
  t.true(stockDomain instanceof Stock)
})

test('should be add a new event on stock', async t => {
  const { stockLocationId, productId } = t.context
  const stockDomain = new Stock()
  const stockData = { stockLocationId, productId, quantity: 10 }
  const createdStock = await stockDomain.add(stockData)

  t.is(stockData.productId, createdStock.productId)
  t.is(stockData.stockLocationId, createdStock.stockLocationId)
  t.is(stockData.quantity, createdStock.quantity)
})