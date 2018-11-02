const expect = require('expect');
const Stock = require('./')
const ProductDomain = require('../Product')
const StockLocationDomain = require('../StockLocation')
const { ValidationError } = require('../../errors')
const mocks = require('../../helpers/mocks')

const stockDomain = new Stock()
const stockLocationDomain = new StockLocationDomain()
const productDomain = new ProductDomain()

describe('add', () => {
  let stockLocation = null
  let product = null

  beforeEach(async () =>{
    stockLocation = await stockLocationDomain.add(mocks.stockLocation())
    product = await productDomain.add(mocks.product())
  })

  test('should add stock record', async () => {
    const stockData = {
      stockLocationId: stockLocation.id,
      productId: product.id,
      quantity: 10 
    }
    const createdStock = await stockDomain.add(stockData)
  
    expect(stockData.productId).toBe(createdStock.productId)
    expect(stockData.stockLocationId).toBe(createdStock.stockLocationId)
    expect(stockData.quantity).toBe(createdStock.quantity)
  })

  test('should not add when productId and stockLocationId are not registered', async () => {
    const stockData = { stockLocationId: null, productId: null, quantity: 10 }

    await expect(stockDomain.add(stockData)).rejects.toThrowError(ValidationError)  
  })
})

describe('getProductQuantity', () => {
  let stockLocation = null
  let product = null

  beforeEach(async () =>{
    stockLocation = await stockLocationDomain.add(mocks.stockLocation())
    product = await productDomain.add(mocks.product())
  })

  test('should return product quantity by productId and stockLocationId', async () => {
    const stockData = {
      stockLocationId: stockLocation.id,
      productId: product.id,
      quantity: 200 
    }
    await stockDomain.add(stockData)
  
    const productQuantity = await stockDomain.getProductQuantity(product.id, stockLocation.id) 
  
    expect(stockData.quantity).toBe(productQuantity)
  })

  test('should return product quantity from all locations', async () => {
    const stockLocation1 = await stockLocationDomain.add(mocks.stockLocation())
    const stockLocation2 = await stockLocationDomain.add(mocks.stockLocation())

    const stockData1 = {
      stockLocationId: stockLocation1.id,
      productId: product.id,
      quantity: 200 
    }

    const stockData2 = {
      stockLocationId: stockLocation2.id,
      productId: product.id,
      quantity: 3200 
    }

    const total = stockData1.quantity + stockData2.quantity
    await stockDomain.add(stockData1)
    await stockDomain.add(stockData2)
  
    const productQuantity = await stockDomain.getProductQuantity(product.id) 
  
    expect(productQuantity).toBe(total)
  })
})

