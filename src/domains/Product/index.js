const db = require('../../db')
const ProductModel = db.model('product')

class Product {
  
  async add(productData, { transaction } = {}) {
    const product = await ProductModel.create(productData, { transaction })
    return product
  }

}

module.exports = Product