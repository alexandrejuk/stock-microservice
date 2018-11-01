const db = require('../../db')
const { FieldValidationError } = require('../../errors')
const  StockDomain = require('../Stock')

const stockDomain = new StockDomain()
const ProductModel = db.model('product')
const OrderModel = db.model('order')
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
      await this.addOrderProduct(orderProduct, order.id, stockLocationId, { transaction })
    }

    return await order.reload({
      include: [{ all: true }]
    })
  }

  async addOrderProduct(orderProductData, orderId, stockLocationId, { transaction } = {}) {
    const product = await ProductModel.findById(orderProductData.productId)
    const unregisteredQuantity = product.hasSerialNumber ? orderProductData.quantity : 0

    if(!product.hasSerialNumber){
      await stockDomain.add({
        productId: orderProductData.productId,
        stockLocationId,
        quantity: orderProductData.quantity
      })
    }

    const orderProduct = {
      unregisteredQuantity,
      orderId,
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

    await stockDomain.add({
      productId: orderProduct.productId,
      stockLocationId: order.stockLocationId,
      quantity: orderProduct.quantity
    })

    return await orderProduct.save({ transaction })
  }
}

module.exports = Order