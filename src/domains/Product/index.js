const db = require('../../db')
const ProductModel = db.model('product')

class Product {
  
  async add(productData, { transaction } = {}) {
    const product = await ProductModel.create(productData, { transaction })
    return product
  }

  async getById(id) {
    return await ProductModel.findByPk(id)
  }

}

module.exports = Product