const test = require('ava')
const mock = require('../../helpers/mocks')
const databaseHelper = require('../../helpers/database')
const ProductDomain = require('../Product')
const Order = require('../Order')
const individualProductDomain = require('./')
const StockLocationDomain = require('../StockLocation')
const { FieldValidationError } = require('../../errors')
const randomDataGenerator = require('../../helpers/randomDataGenerator')

const stockLocationDomain = new StockLocationDomain()
const productDomain = new ProductDomain()
const orderDomain = new Order()

test.before(databaseHelper.isDatabaseConnected)
test.beforeEach(async t => {
  const stockLocation = await stockLocationDomain.add(mock.stockLocation())
  const product = await productDomain.add(mock.product())

  t.context = {}
  t.context.stockLocationId = stockLocation.id 
  t.context.productId = product.id
})

test('should register individual products to the given orderProduct', async t => {
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

  const individualProductData = {
    productId: productWithSerialNumber.id,
    originId: orderProductId,
    originType: 'orderProduct',
    serialNumbers: [
      randomDataGenerator(),
    ]
  }

  const createdIndividualProducList = await individualProductDomain.addMany(individualProductData)
  
  t.is(createdIndividualProducList[0].serialNumber, individualProductData.serialNumbers[0])
})
