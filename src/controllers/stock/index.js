const StockDomain = require('../../domains/Stock')
const stockDomain = new StockDomain()

const get = async (req, res, next) => {
  try {
    const stocks = await stockDomain.getAll()
    res.status(200).json(stocks)
  } catch (error) {
    next(error)
  }
}


module.exports = {
  get,
}