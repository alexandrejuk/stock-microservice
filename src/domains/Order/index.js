const db = require('../../db')
const { FieldValidationError } = require('../../errors')
const  StockDomain = require('../Stock')

const stockDomain = new StockDomain()
const ProductModel = db.model('product')
const OrderModel = db.model('order')
const StockModel = db.model('stock')
const OrderProductModel = db.model('orderProduct')

class Order {

  async add(orderData, { transaction } = {}) {
    const { orderProducts = [], stockLocationId } = orderData
    
    if (orderProducts.length < 1){
      const fields = [
        {
          name: 'orderProducts',
          message: 'length must be bigger than one'
        }
      ]

      throw new FieldValidationError(fields)
    }

    const order = await OrderModel.create(
      orderData, 
      { 
        transaction,
      }
    )

    for (const orderProduct of orderProducts) {
      await this.addOrderProduct(orderProduct, order, { transaction })
    }

    return await order.reload({
      include: [{ all: true }]
    })
  }

  async addOrderProduct(orderProductData, order, { transaction } = {}) {
    const product = await ProductModel.findById(orderProductData.productId)
    const unregisteredQuantity = product.hasSerialNumber ? orderProductData.quantity : 0

    if(!product.hasSerialNumber){
      await order.createStock({
        stockLocationId: order.stockLocationId,
        quantity: orderProductData.quantity,
        description: 'order resgitration',
        productId: orderProductData.productId,
      })
    }

    const orderProduct = {
      unregisteredQuantity,
      orderId: order.id,
      quantity: orderProductData.quantity,
      productId: orderProductData.productId,
    }

    await OrderProductModel.create(orderProduct, { transaction })
  }

  async decreaseOrderProductUnregisteredQuantity(orderProductId, quantity, { transaction } = {}){
    const orderProduct = await OrderProductModel
      .findById(orderProductId)

    orderProduct.unregisteredQuantity -= quantity
    if (orderProduct.unregisteredQuantity < 0){
      const fields =  [{
        name: 'unregisteredQuantity',
        message: `Quantity of the orderProduct id ${orderProductId} cannot be lower than 0`
      }]
      throw new FieldValidationError(fields)
    }

    const order = await OrderModel.findById(orderProduct.orderId)

    await order.createStock({
      quantity,
      productId: orderProduct.productId,
      stockLocationId: order.stockLocationId,
    })

    return await orderProduct.save({ transaction })
  }

  async cancell (orderId) {
    const order = await OrderModel.findByPk(orderId, { include: [StockModel]})

    if (!order) {
      const fields = [
        {
          name: 'order',
          message: 'order not found!'
        }
      ]

      throw new FieldValidationError(fields)
    }

    if (order.status !== 'REGISTERED') {
      const fields = [
        {
          name: 'status',
          message: 'this order is already cancelled!'
        }
      ]

      throw new FieldValidationError(fields)
    }

    for (const stock of order.stocks) {
      await order.createStock({
        productId: stock.productId,
        stockLocationId: stock.stockLocationId,
        description: 'order cancellation',
        quantity: stock.quantity * -1,
      })
    }
    

    order.status = 'CANCELLED'
    await order.save()

    return order
  }
}

module.exports = Order