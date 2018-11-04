const expect = require('expect');
const mock = require('../../helpers/mocks')
const ProductDomain = require('../Product')
const IndividualProductDomain = require('./')
const { FieldValidationError } = require('../../errors')
const database = require('../../db')
const randomDataGenerator = require('../../helpers/randomDataGenerator')

const productDomain = new ProductDomain()
const individualProductDomain = new IndividualProductDomain()

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

  it('all individual products should have default status equals to availabe', () => {
    for(const createdIndividualProduct of createdIndividualProducts){
      expect(createdIndividualProduct.status).toBe('available')
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
      serialNumbers: [
        randomDataGenerator(),
      ]
    }
    
    await expect(individualProductDomain.addMany(individualProductData))
      .rejects.toThrowError(new FieldValidationError())
  })
})

describe('getProductAvailableByProductId', () => {
  test('should throw if there is no available product with for a given product id', async () => {
    await expect(individualProductDomain.getAvailableIndividualProductAndReserve(20020))
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
      serialNumbers: [
        randomDataGenerator(),
        randomDataGenerator(),
      ]
    }

    await individualProductDomain.addMany(individualProductData)

    const reservedIndividualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(product.id)

    expect(reservedIndividualProduct.productId).toBe(product.id)
    expect(reservedIndividualProduct.status).toBe('reserved')
  })

  test('should remain available in case transaction is rollbacked', async () => {
    const IndividualProductModel = database.model('individualProduct')
    const product = await productDomain.add(
      mock.product({ hasSerialNumber: true })
    )

    individualProductData = {
      productId: product.id,
      originId: null,
      originType: null,
      serialNumbers: [
        randomDataGenerator(),
        randomDataGenerator(),
      ]
    }

    await individualProductDomain.addMany(individualProductData)

    const transaction = await database.transaction()
    const reservedIndividualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(product.id, { transaction })
    await transaction.rollback()

    const individualProduct = await IndividualProductModel.findByPk(reservedIndividualProduct.id)

    expect(individualProduct.status).toBe('available')
  })
})
