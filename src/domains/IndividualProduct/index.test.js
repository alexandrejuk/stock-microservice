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

    const serialNumbers = [
      serialNumber1,
      serialNumber2,
    ]

    await IndividualProductModel.bulkCreate(
      serialNumbers.map(serialNumber => ({
        productId: product.id,
        serialNumber,
        stockLocationId: stockLocation.id,
        available: true,
      }))
    )
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
    await expect(individualProductDomain
        .getAvailableIndividualProductAndReserve('c2a93508-8fba-4ebe-b24d-d9a896d4c7b8', stockLocationId))
      .rejects.toThrowError(FieldValidationError)
  })

  test('should return a available individual product id', async () => {
    const product = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    const serialNumbers = [
      randomDataGenerator(),
      randomDataGenerator(),
    ]

    await IndividualProductModel.bulkCreate(
      serialNumbers.map(serialNumber => ({
        productId: product.id,
        serialNumber,
        stockLocationId,
        available: true,
      }))
    )

    const reservedIndividualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(product.id, stockLocationId)

    expect(reservedIndividualProduct.productId).toBe(product.id)
    expect(reservedIndividualProduct.available).toBe(false)
  })

  test('should remain available in case transaction is rollbacked', async () => {
    const product = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    const serialNumbers = [
      randomDataGenerator(),
      randomDataGenerator(),
    ]

    await IndividualProductModel.bulkCreate(
      serialNumbers.map(serialNumber => ({
        productId: product.id,
        serialNumber,
        stockLocationId,
        available: true,
      }))
    )

    const transaction = await database.transaction()
    const reservedIndividualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(product.id, stockLocationId, { transaction })
    await transaction.rollback()

    const individualProduct = await IndividualProductModel.findByPk(reservedIndividualProduct.id)

    expect(individualProduct.available).toBe(true)
  })
})
