const db = require('../../db')
const StockLocationModel = db.model('stockLocation')

class StockLocation {
  
  async add(stockLocationData, { transaction } = {}) {
    const stockLocation = await StockLocationModel.create(stockLocationData, transaction)
    return stockLocation
  }
}

module.exports = StockLocation