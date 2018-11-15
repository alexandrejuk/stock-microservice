const db = require('../../db')
const ProductModel = db.model('product')

class Product {
  
  async add(productData, { transaction } = {}) {
    return await ProductModel.create(productData, { transaction })
  }

  async getById(id) {
    return await ProductModel.findByPk(id)
  }

  async getAll() {
    return await ProductModel.findAll({})
  }

  async updateById(id, product) {
    const productInstance = await this.getById(id)
    await productInstance.update(product)

    return productInstance
  }

}

module.exports = Product