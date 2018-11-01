const database = require('../../db')
const { FieldValidationError } = require('../../errors')
const OrderDomain = require('../Order')

const orderDomain = new OrderDomain()
const IndividualProductModel = database.model('individualProduct')


const addMany = async (individualProductData, { transaction } = {}) => {
  const { type, productId, originId, originType, serialNumbers = [] } = individualProductData

  if(serialNumbers.length < 0){
    const fields = [{
      name: 'serialNumbers',
      message: 'serialNumbers length must be greater than 0'
    }]

    throw new FieldValidationError(fields)
  }

  const individualProductList = serialNumbers.map(serialNumber => ({
    serialNumber,
    originId,
    type,
    productId,
    originType
  }))

  if (originType === 'orderProduct') {
    await orderDomain.decreaseOrderProductUnregisteredQuantity(originId, individualProductList.length, { transaction})
  }
  
  return await IndividualProductModel.bulkCreate(individualProductList, { transaction })
}

module.exports = {
  addMany,
}
