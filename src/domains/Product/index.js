const db = require('../../db')
const getLazyLoadingForModel = require('../../helpers/lazyLoading')
const Sequelize = require('sequelize')
const ProductModel = db.model('product')
const StockModel = db.model('stock')
const StockLocationModel = db.model('stockLocation')


const productLazyLoading =  getLazyLoadingForModel(ProductModel)

class Product {
  
  async add(productData, { transaction } = {}) {
    return await ProductModel.create(productData, { transaction })
  }

  async getById(id) {
    const product = await ProductModel.findByPk(id, { raw: true })

    return {
      ...product,
      quantityEntries: await this.getProductQuantity(id)
    }
  }

  async getAll(query) {
    const lazyLoading = productLazyLoading(query)

    return await ProductModel.findAndCountAll({
      ...lazyLoading,
    })
  }

  async updateById(id, product) {
    const productInstance = await ProductModel.findByPk(id)
    await productInstance.update(product)

    return productInstance
  }

  async getProductQuantity (id) {
    const stockEntries =  await StockModel.findAll({
      where: {
        productId: id
      },
      attributes: ['productId', 'stockLocationId', [Sequelize.fn('Sum', Sequelize.col('quantity')), 'total']],
      include: [
        {
          model: StockLocationModel,
          attributes: ['name']
        },
      ],
      group: ['productId', 'stockLocationId', 'stockLocation.id'],
    })

    return stockEntries
  }

  async getProductsQuantityStockLocationId (stockLocationId) {
    const stockEntries =  await StockModel.findAll({
      where: {
        stockLocationId,
      },
      attributes: ['productId', 'stockLocationId', [Sequelize.fn('Sum', Sequelize.col('quantity')), 'total']],
      include: [
        {
          model: StockLocationModel,
          attributes: ['name']
        },
        {
          model: ProductModel,
          attributes: ['name', 'brand']
        },
      ],
      group: ['productId', 'product.id','stockLocationId', 'stockLocation.id'],
    })

    return stockEntries
  }

  async getProductsQuantityStock () {
    const stockEntries =  await StockModel.findAll({
      attributes: ['productId', [Sequelize.fn('Sum', Sequelize.col('quantity')), 'total']],
      include: [
        {
          model: ProductModel,
          attributes: ['name', 'brand']
        },
      ],
      group: ['productId', 'product.id'],
    })

    return stockEntries
  }

}

module.exports = Product