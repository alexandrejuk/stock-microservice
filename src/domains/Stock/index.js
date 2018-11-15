const db = require('../../db')
const StockModel = db.model('stock')
const StockLocationModel = db.model('stockLocation')
const ProductModel = db.model('product')

const ProductDomain = require('../Product')
const StockLocationDomain = require('../StockLocation')
const { ValidationError } = require('../../errors')

const productDomain = new ProductDomain()
const stockLocationDomain = new StockLocationDomain()

class Stock {
  
  async add(stockData) {
    const { productId, stockLocationId } = stockData
    const foundProduct = await productDomain.getById(productId)
    const foundLocation = await stockLocationDomain.getById(stockLocationId)

    if (foundProduct && foundLocation){
      return await StockModel.create(stockData)
    }

    throw new ValidationError()
  }

  async getProductQuantity(productId, stockLocationId = null) {
    const where = stockLocationId ? { productId, stockLocationId } : { productId }

    const productQuantity = await StockModel.sum(
      'quantity',{
        where
      })
    
    return productQuantity || 0
  }

  async getAll() {
    return await StockModel.findAll({
      include: [
        { model: StockLocationModel, required: true},
        { model: ProductModel, required: true },
      ]
    })
  }
}

module.exports = Stock