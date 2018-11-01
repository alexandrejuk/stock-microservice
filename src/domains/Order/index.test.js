const test = require('ava')
const Order = require('./')
const mock = require('../../helpers/mocks')
const databaseHelper = require('../../helpers/database')
const ProductDomain = require('../Product')
const StockDomain = require('../Stock')
const StockLocationDomain = require('../StockLocation')
const { FieldValidationError } = require('../../errors')

const stockDomain = new StockDomain()
const stockLocationDomain = new StockLocationDomain()
const productDomain = new ProductDomain()

test.before(databaseHelper.isDatabaseConnected)
test.beforeEach(async t => {
  const stockLocation = await stockLocationDomain.add(mock.stockLocation())
  const product = await productDomain.add(mock.product())

  t.context = {}
  t.context.stockLocationId = stockLocation.id 
  t.context.productId = product.id
})

test('should be a instance of order', t => {
  const orderDomain = new Order()
  t.true(orderDomain instanceof Order)
})

test('should throw an expection if orderProducts length less than 1', async (t) => {
  const orderDomain = new Order()
  const orderData = { 
    description: 'teste',
    reason: '',
    status: 'finalizado',
    stockLocationId: t.context.stockLocationId,
  }

  const error = await t.throws(orderDomain.add(orderData)) 

  t.true(error instanceof FieldValidationError)
})

test('should add a new order and its orderProducts', async t => {
  const orderDomain = new Order()
  const orderData = mock.orderData({
    stockLocationId: t.context.stockLocationId,
    orderProducts: [
      {
        productId: t.context.productId,
        quantity: 10
      }
    ]
  })

  const createdOrder = await orderDomain.add(orderData)
  
  t.is(orderData.description.toUpperCase(), createdOrder.description)
  t.is(orderData.reason.toUpperCase(), createdOrder.reason)
  t.is(orderData.status.toUpperCase(), createdOrder.status)
  t.is(orderData.stockLocationId, createdOrder.stockLocationId)
  t.true(createdOrder.orderProducts.length > 0)
  t.is(orderData.orderProducts[0].productId, createdOrder.orderProducts[0].productId)
  t.is(orderData.orderProducts[0].quantity, createdOrder.orderProducts[0].quantity)
  t.is(createdOrder.orderProducts[0].unregisteredQuantity, 0)
})

test('should set unregisteredQuantity to quantity when product has serial number', async t => {
  const orderDomain = new Order()
  const productWithSerialNumber = await productDomain.add(
    mock.product({ hasSerialNumber: true })
  )

  const orderData = mock.orderData({
    stockLocationId: t.context.stockLocationId,
    orderProducts: [
      {
        productId: productWithSerialNumber.id,
        quantity: 200
      }
    ]
  })

  const createdOrder = await orderDomain.add(orderData)

  t.is(orderData.description.toUpperCase(), createdOrder.description)
  t.is(orderData.reason.toUpperCase(), createdOrder.reason)
  t.is(orderData.status.toUpperCase(), createdOrder.status)
  t.is(orderData.stockLocationId, createdOrder.stockLocationId)
  t.true(createdOrder.orderProducts.length > 0)
  t.is(orderData.orderProducts[0].productId, createdOrder.orderProducts[0].productId)
  t.is(orderData.orderProducts[0].quantity, createdOrder.orderProducts[0].quantity)
  t.is(createdOrder.orderProducts[0].unregisteredQuantity, orderData.orderProducts[0].quantity)
})

test('should not decrease unregistered quantity if the unregistered quantity is lower than zero', async t => {
  const orderDomain = new Order()
  const productWithSerialNumber = await productDomain.add(
    mock.product({ hasSerialNumber: true })
  )

  const orderData = mock.orderData({
    stockLocationId: t.context.stockLocationId,
    orderProducts: [
      {
        productId: productWithSerialNumber.id,
        quantity: 200
      }
    ]
  })

  const createdOrder = await orderDomain.add(orderData)
  const orderProductId = createdOrder.orderProducts[0].id

  const error = await t.throws(orderDomain.decreaseOrderProductUnregisteredQuantity(orderProductId, 201))
  
  t.true(error instanceof FieldValidationError)
  t.is(error.fields[0].name, 'unregisteredQuantity')
  t.is(error.fields[0].message, `Quantity of the orderProduct id ${orderProductId} cannot be lower than 0`)
})

test('should decrease unregistered quantity according to the quantity passed', async t => {
  const orderDomain = new Order()
  const productWithSerialNumber = await productDomain.add(
    mock.product({ hasSerialNumber: true })
  )

  const orderData = mock.orderData({
    stockLocationId: t.context.stockLocationId,
    orderProducts: [
      {
        productId: productWithSerialNumber.id,
        quantity: 200
      }
    ]
  })

  const createdOrder = await orderDomain.add(orderData)
  const orderProductId = createdOrder.orderProducts[0].id

  const orderProduct = await orderDomain.decreaseOrderProductUnregisteredQuantity(orderProductId, 100)
  
  t.is(orderProduct.unregisteredQuantity, 100)
})

test('should insert stock quantity of a give order product if its product does not have serial number', async t => {
  const orderDomain = new Order()
  const orderData = mock.orderData({
    stockLocationId: t.context.stockLocationId,
    orderProducts: [
      {
        productId: t.context.productId,
        quantity: 10
      }
    ]
  })

  const createdOrder = await orderDomain.add(orderData)
  const productQuantity = await stockDomain
    .getProductQuantity(
      t.context.productId,
      t.context.stockLocationId
    )

  t.is(orderData.orderProducts[0].quantity, productQuantity)
})