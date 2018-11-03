const expect = require('expect');
const Order = require('./')
const mock = require('../../helpers/mocks')
const ProductDomain = require('../Product')
const StockDomain = require('../Stock')
const StockLocationDomain = require('../StockLocation')
const { FieldValidationError } = require('../../errors')
const database = require('../../db')

const OrderProductModel = database.model('orderProduct')
const OrderModel = database.model('order')
const stockDomain = new StockDomain()
const orderDomain = new Order()
const stockLocationDomain = new StockLocationDomain()
const productDomain = new ProductDomain()

describe('add', () => {
  test('should throw an exception if order data has less than 1 orderProduct', async () => {
    const orderData = { 
      description: 'teste',
      reason: '',
      status: 'REGISTERED',
      stockLocationId: 3232,
    }

    await expect(orderDomain.add(orderData)).rejects.toThrow(FieldValidationError) 
  })

  describe('add a new order', () => {
    let createdOrder = null
    let stockLocationId = null
    let productId = null
    let productWithSerialNumberId = null
    let product = null
    let productWithSerialNumber = null
    let orderData = null
    
    beforeAll(async () => {
      const stockLocation = await stockLocationDomain.add(mock.stockLocation())
      product = await productDomain.add(mock.product())
      productWithSerialNumber = await productDomain.add(mock.product({
        hasSerialNumber: true,
      }))

      stockLocationId = stockLocation.id 
      productId = product.id
      productWithSerialNumberId = productWithSerialNumber.id

      orderData = mock.orderData({
        stockLocationId: stockLocationId,
        orderProducts: [
          {
            productId: productId,
            quantity: 10
          },
          {
            productId: productWithSerialNumberId,
            quantity: 200
          }
        ]
      })

      createdOrder = await orderDomain.add(orderData)
    })

    test('should persist and format order data', () => {
      expect(orderData.description.toUpperCase()).toBe(createdOrder.description)
      expect(orderData.reason.toUpperCase()).toBe(createdOrder.reason)
      expect(orderData.status.toUpperCase()).toBe(createdOrder.status)
      expect(orderData.stockLocationId).toBe(createdOrder.stockLocationId) 
    })

    describe('include orderProducts', () => {
      let productWithoutSerialNumber = null
      let productWitSerialNumber = null
  
      beforeAll(() => {
        productWithoutSerialNumber = createdOrder.orderProducts
            .find(order => order.productId === productId)

        productWitSerialNumber = createdOrder.orderProducts
          .find(order => order.productId === productWithSerialNumberId)
      })
    
      describe('when it does not have serial number', () => {
        test('should have unregistered quantity equals 0', () =>{
          expect(productWithoutSerialNumber.productId).toBe(orderData.orderProducts[0].productId)
          expect(productWithoutSerialNumber.quantity).toBe(orderData.orderProducts[0].quantity)
          expect(productWithoutSerialNumber.unregisteredQuantity).toBe(0)
        })

        test('should insert stock', async () => {
          const productQuantity = await stockDomain
            .getProductQuantity(
              productWithoutSerialNumber.productId,
              orderData.stockLocationId
            )
        
          expect(orderData.orderProducts[0].quantity).toBe(productQuantity)
        })
      })

      describe('when it has have serial number', () => {
        test('and have unregisteredQuantity equals quantity if product has serial number', () => {
          expect(productWitSerialNumber.productId).toBe(orderData.orderProducts[1].productId)
          expect(productWitSerialNumber.quantity).toBe(orderData.orderProducts[1].quantity)
          expect(productWitSerialNumber.unregisteredQuantity).toBe(orderData.orderProducts[1].quantity)
        })

        test('should insert stock', async () => {
          const productQuantity = await stockDomain
            .getProductQuantity(
              productWitSerialNumber.productId,
              orderData.stockLocationId
            )
        
          expect(productQuantity).toBe(0)
        })
      })
    })
  })
})

describe('decreaseOrderProductUnregisteredQuantity', () => {
  let createdOrder = null
  let stockLocationId = null
  let productId = null
  let orderData = null
  
  beforeEach(async () => {
    const stockLocation = await stockLocationDomain.add(mock.stockLocation())
    const product = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    stockLocationId = stockLocation.id 
    productId = product.id

    orderData = mock.orderData({
      stockLocationId: stockLocationId,
      orderProducts: [
        {
          productId: productId,
          quantity: 200
        },
      ]
    })

    createdOrder = await orderDomain.add(orderData)
  })

  test('should throw if quantity  quantity is greater than the unregistered quantity ', async () => {
    const orderProductId = createdOrder.orderProducts[0].id
  
    await expect(orderDomain.decreaseOrderProductUnregisteredQuantity(orderProductId, 201))
      .rejects.toThrowError(FieldValidationError)
  })

  test('should decrease unregistered quantity', async () => {
    const orderProductId = createdOrder.orderProducts[0].id
  
    const orderProduct = await orderDomain
      .decreaseOrderProductUnregisteredQuantity(orderProductId, 100)
    
    expect(orderProduct.unregisteredQuantity).toBe(100)
  })

  test('should insert in stock', async () => {
    const orderProduct = createdOrder.orderProducts[0]
    await orderDomain
      .decreaseOrderProductUnregisteredQuantity(orderProduct.id, 100)
   
    const quantityInStock = await stockDomain
      .getProductQuantity(orderProduct.productId, createdOrder.stockLocationId)
    
    expect(quantityInStock).toBe(100)
  })
})

describe('cancell', () => {
  let createdOrder = null
  let stockLocationId = null
  let orderData = null
  let products = []
  
  beforeEach(async () => {
    const stockLocation = await stockLocationDomain.add(mock.stockLocation())
    products = [
      await productDomain.add(
        mock.product({ hasSerialNumber: true }),
      ),
      await productDomain.add(
        mock.product(),
      ),
      await productDomain.add(
        mock.product({ hasSerialNumber: true }),
      ),
      await productDomain.add(
        mock.product(),
      ),
    ]


    stockLocationId = stockLocation.id 

    orderData = mock.orderData({
      stockLocationId: stockLocationId,
      orderProducts: products.map(product => ({
        productId: product.id,
        quantity: 100,
      }))
    })

    createdOrder = await orderDomain.add(orderData)
  })

  test('should return cancelled order if everything is okay', async () => {
    const cancelledOrder = await orderDomain.cancell(createdOrder.id)

    expect(cancelledOrder.id).toBe(createdOrder.id)
    expect(cancelledOrder.status).toBe('CANCELLED')
  })

  test('should thorw error if order has a status diffent of REGISTERED', async () => {
    await orderDomain.cancell(createdOrder.id)

    await expect(orderDomain.cancell(createdOrder.id))
      .rejects
      .toThrowError(FieldValidationError)
  })

  test('should thorw error if order is not found', async () => {
    await expect(orderDomain.cancell('323232'))
      .rejects
      .toThrowError(FieldValidationError)
  })

  test('each order product should have its quantity equals 0 after the cancellation', async () => {
    await orderDomain.cancell(createdOrder.id)
    
    for (const product of products) {
      const quantity = await stockDomain.getProductQuantity(product.id, stockLocationId)

      expect(quantity).toBe(0)
    }
  })
})