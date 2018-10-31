const db = require('../../db')
const ProductModel = db.model('product')
const OrderModel = db.model('order')
const OrderProductModel = db.model('orderProduct')

class Order {

  async add(orderData, { transaction } = {}) {
    return await OrderModel.create(
      orderData, 
      { 
        transaction, 
        include: [
          { 
            model: ProductModel, 
            through: OrderProductModel
          }
        ],
       
      }
    )
  }
}

module.exports = Order