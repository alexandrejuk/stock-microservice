const mocks = require('../../helpers/mocks')
const request = require('../../helpers/request')
const ProductDomain = require('../../domains/Product')
const StockLocationDomain = require('../../domains/StockLocation')

const productDomain = new ProductDomain()
const stockLocationDomain = new StockLocationDomain()

let createProduct = null
let createStockLocation = null

beforeAll(async() => {
  createProduct = await productDomain.add(mocks.product())
  createStockLocation = await stockLocationDomain.add(mocks.stockLocation())
})

describe('post /orders', () => {

  test('should add a new order', async () => {
    const orderData = {
      ...mocks.orderData(),
      stockLocationId: createStockLocation.id,
      orderProducts: [{
        productId: createProduct.id,
        quantity: 10
      }]
    }

    const response = await request().post('/api/orders', orderData)
    expect(response.statusCode).toBe(200)
  })

  test('should add a new order without some fields', async () => {
    const response = await request().post('/api/orders', { description: 'order one'})
    expect(response.statusCode).toBe(422)
  })


})


