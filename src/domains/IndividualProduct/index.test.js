const expect = require('expect');
const mock = require('../../helpers/mocks')
const ProductDomain = require('../Product')
const individualProductDomain = require('./')
const { FieldValidationError } = require('../../errors')
const randomDataGenerator = require('../../helpers/randomDataGenerator')

const productDomain = new ProductDomain()

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
