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

module.exports = {
  add,
}