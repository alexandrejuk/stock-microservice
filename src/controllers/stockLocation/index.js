const StockLocationDomain = require('../../domains/StockLocation')
const stockLocationDomain = new StockLocationDomain()

const get = async (req, res, next) => {
  try {
    const locations = await stockLocationDomain.getAll()
    res.status(200).json(locations)
  } catch (error) {
    next(error)
  }
}


module.exports = {
  get,
}