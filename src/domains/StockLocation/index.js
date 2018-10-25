const db = require('../../db')
const StockLocationModel = db.model('stockLocation')

class StockLocation {
  
  async add(stockLocationData) {
    const stockLocation = await StockLocationModel.create(stockLocationData)
    return stockLocation
  }
}

module.exports = StockLocation