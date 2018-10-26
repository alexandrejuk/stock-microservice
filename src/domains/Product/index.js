const db = require('../../db')
const ProductModel = db.model('product')

class Product {
  
  async add(productData, { transaction } = {}) {
    return await ProductModel.create(productData, { transaction })
  }

  async getById(id) {
    return await ProductModel.findByPk(id)
  }

}

module.exports = Product