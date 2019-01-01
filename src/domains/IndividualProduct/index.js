const database = require('../../db')
const { FieldValidationError } = require('../../errors')

const IndividualProductModel = database.model('individualProduct')
const ProductModel = database.model('product')
const StockLocationModel = database.model('stockLocation')

class IndividualProduct {
  async getAvailableQuantityByProductIdAndStockLocationId (productId, stockLocationId, { transaction } = {}) {
    const quantity = await IndividualProductModel.count({
      where: {
        available: true,
        productId,
        stockLocationId,
      },
      transaction,
    })

    return quantity
  }

  async getAvailableIndividualProductAndReserve (productId, stockLocationId, { transaction } = {}) {
    const availableIndividualProduct = await IndividualProductModel.findOne({
      where: {
        available: true,
        productId,
        stockLocationId,
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

    availableIndividualProduct.available = false
    await availableIndividualProduct.save({ transaction })

    return availableIndividualProduct
  }

  async getAll () {
    return await IndividualProductModel.findAll({
      include: [
        { model: StockLocationModel, required: true },
        { model: ProductModel, required: true },
      ]
    })
  }

  async getById (id, { transaction } = {}) {
    return await IndividualProductModel.findByPk(id, {
      include: [
        StockLocationModel,
        ProductModel,
      ],
    })
  }

  async makeAvailableById(id, { transaction } = {}) {
    const individualProduct = await this.getById(id)

    individualProduct.available = true
    await individualProduct.save({ transaction })
  }

  async reserveById(id, { transaction } = {}) {
    const individualProduct = await this.getById(id, { transaction })
    if(individualProduct.available) {
      individualProduct.available = false

      await individualProduct.save({ transaction })
    } else {
      throw new FieldValidationError([{
        name: 'available',
        message: 'This product must be available in order for you to reserve it',
      }])
    }
  }

  async reserveByProductIdAndSerialNumber(productId, serialNumber, stockLocationId, { transaction } = {}) {
    const individualProduct = await IndividualProductModel.findOne({
      where: {
        productId,
        stockLocationId,
        serialNumber,
      },
      transaction,
    })

    if(!individualProduct){
      throw new Error('Product has not being found!')
    }
    
    await this.reserveById(individualProduct.id, { transaction })

    return individualProduct
  }

  async updateById(id, serialNumber) {
    const individualProductInstance = await this.getById(id)
    await IndividualProductModel.update(
      { serialNumber },
      { where: { id } }
    )

    return individualProductInstance
  }
  
}

module.exports = IndividualProduct