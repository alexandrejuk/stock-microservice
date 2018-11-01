const test = require('ava')
const Stock = require('./')
const { StockLocationDomain, ProductDomain } = require('../')
const { ValidationError } = require('../../errors')
const databaseHelper = require('../../helpers/database')

const stockDomain = new Stock()

const productMock = {
  name: 'iphone 7s',
  brand: 'apple',
  sku: 'a1v456578',
  category: 'cell phone',
  hasSerialNumber: true,
  priceBuy: 89000,
  priceSell: 123000
}

const stockLocationMock = { name: 'amazon' }


test.before(databaseHelper.isDatabaseConnected)

test.beforeEach(async t => {
  const stockLocationDomain = new StockLocationDomain()
  const productDomain = new ProductDomain()

  const stockLocationData = stockLocationMock
  const stockLocation = await stockLocationDomain.add(stockLocationData)

  const productData = productMock
  const product = await productDomain.add(productData)

  t.context = {}
  t.context.stockLocationId = stockLocation.id 
  t.context.productId = product.id
})

test('Should be a stock instance', t => {
  t.true(stockDomain instanceof Stock)
})

test('should be add a new event on stock', async t => {
  const { stockLocationId, productId } = t.context
  const stockData = { stockLocationId, productId, quantity: 10 }
  const createdStock = await stockDomain.add(stockData)

  t.is(stockData.productId, createdStock.productId)
  t.is(stockData.stockLocationId, createdStock.stockLocationId)
  t.is(stockData.quantity, createdStock.quantity)
})

test('should not add stock if stock location or product id dont exist', async t => {
  const stockData = { stockLocationId: null, productId: null, quantity: 10 }
  const error = await t.throws(stockDomain.add(stockData))

	t.true(error instanceof ValidationError)
});

