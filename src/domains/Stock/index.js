const db = require('../../db')
const StockModel = db.model('stock')
const { ProductDomain, StockLocationDomain } = require('../')
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

}

module.exports = Stock