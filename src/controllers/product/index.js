const ProductDomain = require('../../domains/Product')

const productDomain = new ProductDomain()

const add = async (req, res, next) => {
  try {
    const product = await productDomain.add(req.body)

    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}

const get = async (req, res, next) => {
  try {
    const products = await productDomain.getAll(req.query)
    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await productDomain.getById(id)
    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}

const getStockProducts = async (req, res, next) => {
  try {
    const product = await productDomain.getProductsQuantityStock()
    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}

const getStockProductsStockLocationId = async (req, res, next) => {
  try {
    const product = await productDomain.getProductsQuantityStockLocationId(req.params.stockLocationId)
    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await productDomain.updateById(id, req.body)
    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}


module.exports = {
  add,
  get,
  getById,
  update,
  getStockProducts,
  getStockProductsStockLocationId
}