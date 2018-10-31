const test = require('ava')
const Order = require('./')
const databaseHelper = require('../../helpers/database')
const ProductDomain = require('../Product')
const StockLocationDomain = require('../StockLocation')

const orderDataMock = { 
  description: 'teste',
  reason: '',
  status: 'finalizado',
}

const productMock = {
  name: 'iphone 7s',
  brand: 'apple',
  sku: 'a1v456578',
  category: 'cell phone',
  serialControl: true,
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


test('should be a instance of order', t => {
  const orderDomain = new Order()
  t.true(orderDomain instanceof Order)
})

test('should add a new order', async t => {
  const orderDomain = new Order()
  const orderData = { 
    description: 'teste',
    reason: '',
    status: 'finalizado',
    stockLocationId: t.context.stockLocationId,
    orderProducts: [
      {
        productId: t.context.productId,
        quantity: 10
      }
    ]
  }

  const createdOrder = await orderDomain.add(orderData)

  t.is(orderData.description.toUpperCase(), createdOrder.description)
  t.is(orderData.reason.toUpperCase(), createdOrder.reason)
  t.is(orderData.status.toUpperCase(), createdOrder.status)
  t.is(orderData.stockLocationId, createdOrder.stockLocationId)
  t.true(createdOrder.orderProducts.length > 0)
})
