const database = require('../../db')
const { FieldValidationError } = require('../../errors')
const OrderDomain = require('../Order')
const ProductDomain = require('../Product')

const orderDomain = new OrderDomain()
const productDomain = new ProductDomain()
const IndividualProductModel = database.model('individualProduct')


class IndividualProduct {
  async addMany (individualProductData, { transaction } = {}) {
    const { type, productId, originId, originType, serialNumbers = [] } = individualProductData
  
    if (!serialNumbers || serialNumbers.length < 1) {
      const fields = [{
        name: 'serialNumbers',
        message: 'serialNumbers length must be greater than 0'
      }]
  
      throw new FieldValidationError(fields)
    }
  
    const product = await productDomain.getById(productId)
  
    if(!product.hasSerialNumber) {
      const fields = [{
        name: 'productId',
        message: 'this product does not allow you to register a individual product'
      }]
  
      throw new FieldValidationError(fields)
    }
  
    const individualProductList = serialNumbers.map(serialNumber => ({
      serialNumber,
      originId,
      type,
      productId,
      originType,
      status: 'available'
    }))
  
    if (originType === 'orderProduct') {
      await orderDomain.decreaseOrderProductUnregisteredQuantity(originId, individualProductList.length, { transaction})
    }
    
    return await IndividualProductModel.bulkCreate(individualProductList, { transaction })
  }

  async getAvailableIndividualProductAndReserve (productId, { transaction } = {}) {
    const availableIndividualProduct = await IndividualProductModel.findOne({
      where: {
        status: 'available',
        productId: productId,
      },
      transaction,
    })

    if (!availableIndividualProduct) {
      const fields = [{
        name: 'productId',
        message: `there is no individual product available with the given id ${productId}`
      }]
  
      throw new FieldValidationError(fields)
    } 

    availableIndividualProduct.status = 'reserved'
    await availableIndividualProduct.save({ transaction })

    return availableIndividualProduct
  }
}

module.exports = IndividualProduct