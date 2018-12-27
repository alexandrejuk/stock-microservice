const mock = require('../../helpers/mocks')
const ProductDomain = require('../Product')
const StockLocationDomain = require('../StockLocation')
const IndividualProductDomain = require('./')
const { FieldValidationError } = require('../../errors')
const database = require('../../db')
const randomDataGenerator = require('../../helpers/randomDataGenerator')

const productDomain = new ProductDomain()
const individualProductDomain = new IndividualProductDomain()
const stockLocationDomain = new StockLocationDomain()

const IndividualProductModel = database.model('individualProduct')

let stockLocationId = null
beforeAll(async () => {
  const createdStockLocation = await stockLocationDomain.add({
    name: 'fake location'
  })

  stockLocationId = createdStockLocation.id
})

describe('addMahy  with correct individual product data', async () => {
  let createdIndividualProducts = null
  let individualProductData = null

  beforeAll(async () => {
    const productWithSerialNumber = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    individualProductData = {
      productId: productWithSerialNumber.id,
      originId: null,
      originType: null,
      stockLocationId,
      serialNumbers: [
        randomDataGenerator(),
        randomDataGenerator(),
        randomDataGenerator(),
        randomDataGenerator(),
        randomDataGenerator(),
        randomDataGenerator(),
      ]
    }

    createdIndividualProducts = await individualProductDomain.addMany(individualProductData)
  })


  it('should add all serialNumbers as individual products', () => {
    expect(createdIndividualProducts.length).toBe(individualProductData.serialNumbers.length)
  })

  it('all serial numbers add should have the belong to the given productId', () => {
    for(const createdIndividualProduct of createdIndividualProducts){
      expect(createdIndividualProduct.productId).toBe(individualProductData.productId)
    }
  })

  it('all individual products should have default available equals to true', () => {
    for(const createdIndividualProduct of createdIndividualProducts){
      expect(createdIndividualProduct.available).toBe(true)
    }
  })

  it('all individual products should the specific stockLocationId', () => {
    for(const createdIndividualProduct of createdIndividualProducts){
      expect(createdIndividualProduct.stockLocationId).toBe(stockLocationId)
    }
  })

  it('default originId and originType should be null if not specified', () => {
    for(const createdIndividualProduct of createdIndividualProducts){
      expect(createdIndividualProduct.originId).toBeNull()
      expect(createdIndividualProduct.originType).toBeNull()
    }
  })
})

describe('add many with incorrect data', () => {
  it('should throw an error if the number of serialNumbers is less than 0', async () => {
    const product = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    const individualProductData = {
      productId: product.id,
      originId: null,
      originType: null,
      stockLocationId,
      serialNumbers: [
      ]
    }

    await expect(individualProductDomain.addMany(individualProductData))
      .rejects.toThrowError(FieldValidationError)
  })

  it('should throw an error if the product does not allow serial number', async () => {
    const product = await productDomain.add(
      mock.product({ hasSerialNumber: false })
    )

    const individualProductData = {
      productId: product.id,
      originId: null,
      originType: null,
      stockLocationId,
      serialNumbers: [
        randomDataGenerator(),
      ]
    }
    
    await expect(individualProductDomain.addMany(individualProductData))
      .rejects.toThrowError(new FieldValidationError())
  })
})

describe('reserveByProductIdAndSerialNumber', () => {
  let product = null
  let stockLocation = null
  let serialNumber1 = null
  let serialNumber2 = null

  beforeEach(async () => {
    product = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    serialNumber1 = randomDataGenerator()
    serialNumber2 = randomDataGenerator()

    stockLocation = await stockLocationDomain.add({
      name: 'fake location'
    })

    individualProductData = {
      productId: product.id,
      originId: null,
      originType: null,
      stockLocationId: stockLocation.id,
      serialNumbers: [
        serialNumber1,
        serialNumber2,
      ]
    }

    await individualProductDomain.addMany(individualProductData)
  })

  test('should reserve it if given productId, serialNumber and stockLocationId is right', async () => {
    await individualProductDomain.reserveByProductIdAndSerialNumber(
      product.id,
      serialNumber1,
      stockLocation.id,
    )

    const individualProduct = await IndividualProductModel.findOne({
      where: {
        productId: product.id,
        serialNumber: serialNumber1,
      }
    })

    expect(individualProduct.available).toBe(false)
  })

  test('should throw error if serial number has already been reserved', async () => {
    await individualProductDomain.reserveByProductIdAndSerialNumber(
      product.id,
      serialNumber2,
      stockLocation.id,
    )

    await expect(
      individualProductDomain.reserveByProductIdAndSerialNumber(
        product.id,
        serialNumber2,
        stockLocation.id,
      )
    ).rejects.toThrow()
  })
})

describe('getProductAvailableByProductId', () => {
  test('should throw if there is no available product with for a given product id', async () => {
    await expect(individualProductDomain.getAvailableIndividualProductAndReserve(20020, stockLocationId))
      .rejects.toThrowError(FieldValidationError)
  })

  test('should return a available individual product id', async () => {
    const product = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    individualProductData = {
      productId: product.id,
      originId: null,
      originType: null,
      stockLocationId,
      serialNumbers: [
        randomDataGenerator(),
        randomDataGenerator(),
      ]
    }

    await individualProductDomain.addMany(individualProductData)

    const reservedIndividualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(product.id, stockLocationId)

    expect(reservedIndividualProduct.productId).toBe(product.id)
    expect(reservedIndividualProduct.available).toBe(false)
  })

  test('should remain available in case transaction is rollbacked', async () => {
    const product = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    individualProductData = {
      productId: product.id,
      originId: null,
      originType: null,
      stockLocationId,
      serialNumbers: [
        randomDataGenerator(),
        randomDataGenerator(),
      ]
    }

    await individualProductDomain.addMany(individualProductData)

    const transaction = await database.transaction()
    const reservedIndividualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(product.id, stockLocationId, { transaction })
    await transaction.rollback()

    const individualProduct = await IndividualProductModel.findByPk(reservedIndividualProduct.id)

    expect(individualProduct.available).toBe(true)
  })
})
