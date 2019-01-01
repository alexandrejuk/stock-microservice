const db = require('../../db')
const { FieldValidationError } = require('../../errors')
const StockDomain = require('../Stock')
const ProductDomain = require('../Product')

const stockDomain = new StockDomain()
const productDomain = new ProductDomain()

const ProductModel = db.model('product')
const IndividualProductModel = db.model('individualProduct')
const OrderModel = db.model('order')
const StockModel = db.model('stock')
const OrderProductModel = db.model('orderProduct')
const StockLocationModel = db.model('stockLocation')

class Order {
  async addIndividualProducts (orderId, orderProductId, serialNumbers = [], { transaction } = {}) {
    if (!serialNumbers || serialNumbers.length < 1) {
      const fields = [{
        name: 'serialNumbers',
        message: 'serialNumbers length must be greater than 0'
      }]
  
      throw new FieldValidationError(fields)
    }

    const order = await OrderModel.findByPk(orderId)
    const orderProduct = await OrderProductModel.findByPk(orderProductId)

    if (!order) {
      throw new Error('Order product not found')
    }

    if(!orderProduct) {
      throw new Error('OrderProduct product not found')
    }
  
    const product = await productDomain.getById(orderProduct.productId)
  
    if(!product.hasSerialNumber) {
      const fields = [{
        name: 'productId',
        message: 'this product does not allow you to register a individual product'
      }]
  
      throw new FieldValidationError(fields)
    }
  
    const individualProductList = serialNumbers.map(serialNumber => ({
      serialNumber,
      originId: orderId,
      productId: product.id,
      originType: 'order',
      stockLocationId: order.stockLocationId,
      available: true,
    }))
  
    await this.decreaseOrderProductUnregisteredQuantity(orderProduct.id, individualProductList.length, { transaction})
    
    return await IndividualProductModel.bulkCreate(individualProductList, { transaction })
  }

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
    }, { transaction })

    return await orderProduct.save({ transaction })
  }

  async cancell (orderId, { transaction } = {}) {
    const order = await OrderModel.findByPk(orderId, { include: [StockModel], transaction })

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
      const availableQuantity = await stockDomain.getProductQuantity(stock.productId, stock.stockLocationId)

      if(availableQuantity < stock.quantity){
        throw new Error('You cannot cancell this order')
      }

      await order.createStock({
        productId: stock.productId,
        stockLocationId: stock.stockLocationId,
        description: 'order cancellation',
        quantity: stock.quantity * -1,
      }, { transaction })
    }
    
    await this.remoteIndividualProducts(order.id, { transaction })

    order.status = 'CANCELLED'
    await order.save({ transaction })

    return order
  }

  async getById(id) {
    return await OrderModel.findByPk(id, {
      include: [
        { model: StockLocationModel, required: true},
        { 
          model: OrderProductModel, 
          include: [
            {
              model: ProductModel
            }
          ]
        },
     ]
    })
  }

  async getAll() {
    return await OrderModel.findAll({})
  }

  async remoteIndividualProducts (id, { transaction } = {}) {
    const countNotAvailable = await IndividualProductModel
      .count({
        where: {
          originId: id,
          originType: 'orderProduct',
          available: false,
        },
      })
  
    if(countNotAvailable > 0) {
      throw new Error('This order has individual products that are already reserved')
    }
    
    return await IndividualProductModel
      .destroy({
        where: {
          originId: id,
          originType: 'orderProduct',
        },
        force: true,
        transaction,
      })
  }
}

module.exports = Order