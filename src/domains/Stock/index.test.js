const test = require('ava')
const Stock = require('./')
const ProductDomain = require('../Product')
const StockLocationDomain = require('../StockLocation')
const { ValidationError } = require('../../errors')
const databaseHelper = require('../../helpers/database')
const mocks = require('../../helpers/mocks')

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
const stockLocationDomain = new StockLocationDomain()
const productDomain = new ProductDomain()

test.before(databaseHelper.isDatabaseConnected)

test.beforeEach(async t => {
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

test('should return product quantity by productId and stockLocationId', async t => {
  const { stockLocationId, productId } = t.context
  const stockData = { stockLocationId, productId, quantity: 20 }
  await stockDomain.add(stockData)

  const productQuantity = await stockDomain.getProductQuantity(productId, stockLocationId) 

  t.is(stockData.quantity, productQuantity)
})

// test('should return product quantity by productId in all locations', async t => {
//   const { productId } = t.context
//   const stockLocation1 = await stockLocationDomain.add(mocks.stockLocation())
//   const stockLocation2 = await stockLocationDomain.add(mocks.stockLocation())

//   const stockData1 = { stockLocationId: stockLocation1.id, productId, quantity: 20 }
//   const stockData2 = { stockLocationId: stockLocation2.id, productId, quantity: 50 }
//   const total = stockData1.quantity + stockData2.quantity

//   await stockDomain.add(stockData1)
//   await stockDomain.add(stockData2)

//   const productQuantity = await stockDomain.getProductQuantity(productId) 

//   t.is(total, productQuantity)
// })
