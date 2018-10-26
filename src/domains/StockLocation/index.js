const db = require('../../db')
const StockLocationModel = db.model('stockLocation')

class StockLocation {
  
  async add(stockLocationData, { transaction } = {}) {
    const stockLocation = await StockLocationModel.create(stockLocationData, { transaction })
    return stockLocation
  }

  async getById(id) {
    const stockLocation = await StockLocationModel.findByPk(id)
    return stockLocation
  }
}

module.exports = StockLocation