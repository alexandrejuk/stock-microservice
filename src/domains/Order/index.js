const db = require('../../db')
const OrderModel = db.model('order')

class Order {

  async add(orderData, { transaction } = {}) {
    return await OrderModel.create(orderData, { transaction })
  }
}

module.exports = Order