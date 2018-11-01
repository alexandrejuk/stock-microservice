const db = require('../../db')
const { FieldValidationError } = require('../../errors')

const ProductModel = db.model('product')
const OrderModel = db.model('order')
const OrderProductModel = db.model('orderProduct')
class Order {

  async add(orderData, { transaction } = {}) {
    const { orderProducts = [] } = orderData
    
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
      await this.addOrderProduct(orderProduct, order.id, { transaction })
    }

    return await order.reload({
      include: [{ all: true }]
    })
  }

  async addOrderProduct(
    orderProductData,
    orderId,
    {
      transaction
    }
  ) {
    const product = await ProductModel.findById(orderProductData.productId)
    const unregisteredQuantity = product.hasSerialNumber ? orderProductData.quantity : 0

    const orderProduct = {
      unregisteredQuantity,
      orderId,
      quantity: orderProductData.quantity,
      productId: orderProductData.productId,
    }

    await OrderProductModel.create(orderProduct)
  }
}

module.exports = Order