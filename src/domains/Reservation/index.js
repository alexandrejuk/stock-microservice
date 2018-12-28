const database = require('../../db')
const Sequelize = require('sequelize')
const ProductDomain = require('../Product')
const StockDomain = require('../Stock')
const CustomerDomain = require('../Customer')
const IndividualProductDomain = require('../IndividualProduct')
const { FieldValidationError } = require('../../errors')

const ReservationModel = database.model('reservation')
const ReservationProduct = database.model('reservationProduct')
const HistoryModel = database.model('reservationProductHistory')

const IndividualProductModel = database.model('individualProduct')
const ProductModel = database.model('product')
const StockLocationModel = database.model('stockLocation')
const CustomerModel = database.model('customer')

const productDomain = new ProductDomain()
const individualProductDomain = new IndividualProductDomain()
const stockDomain = new StockDomain()
const customerDomain = new CustomerDomain()

const include = [
  CustomerModel,
  {
    model: StockLocationModel,
    attributes: ['name']
  },
  {
    model: ReservationProduct,
    as: 'products',
    include: [
      {
        model: ProductModel,
        attributes: ['name', 'brand', 'sku','category']
      },
      {
        model: HistoryModel,
        as: 'history'
      },
      IndividualProductModel
    ],
  },
]

class Reservation {
  async getAll() {
    return await ReservationModel.findAll({
      include,
    })
  }

  async getAllProducts(employeeId) {
    const products = await ReservationProduct
      .findAll({
        order: [
          ['id', 'ASC']
        ],
        include: [
          {
            model: ReservationModel,
            include: [CustomerModel],
            where: {
              // employeeId
            }
          },
          {
            model: ProductModel,
            attributes: ['name', 'brand', 'sku','category']
          },
          {
            model: HistoryModel,
            as: 'history'
          },
          IndividualProductModel,
        ]
      })

    return products
  }

  async getById(id) {
    return await ReservationModel.findByPk(id, { include });
  }

  async add (reservationData, options = {}) {
    const { transaction } = options
    const customer = await customerDomain.getById(reservationData.customerId, options)
    
    if(!customer){
      throw new Error("Customer not found, it")
    }

    const createdReservation = await ReservationModel.create(
      reservationData,
      { transaction },
    )

    for(const reservationProduct of reservationData.products) {
      await this.addProduct(
        reservationProduct,
        createdReservation,
        options,
      )
    }

    createdReservation.setCustomer(customer)
    await createdReservation.save()
    
    await createdReservation.reload({
      transaction,
      include,
    })

    return createdReservation
  }

  async deleteHistory(historyId, { transaction} = {}) {
    const history = await HistoryModel.findByPk(historyId, { transaction })

    if(history.type === 'cancel'){
      throw new Error('this history cannot be deleted')
    }

    if(history.deletedAt){
      throw new Error('this history cannot be deleted again')
    }

    const { type, quantity } = history
    const { reservationProductId } = history
    const productReservation = await ReservationProduct
    .findByPk(
      reservationProductId,
      {
        transaction,
        include: [ReservationModel]
      })

    const newQuantity = productReservation.currentQuantity + quantity

    if(newQuantity > productReservation.quantity){
      throw new Error('quantity exceeds the reserved quantity')
    }

    productReservation.currentQuantity = newQuantity
    await productReservation.save({ transaction })
  
    await history.destroy({ transaction })
    const createdHistory = await HistoryModel.create({
      quantity,
      reservationProductId,
      type: 'cancel'
    }, { transaction })

    if(type === 'return') {
      if(productReservation.individualProductId) {
        await individualProductDomain.reserveById(productReservation.individualProductId, { transaction })
      }
      
      await stockDomain.add({
        stockLocationId: productReservation.reservation.stockLocationId,
        productId: productReservation.productId,
        quantity: quantity * -1,
        originId: productReservation.reservation.id,
        originType: 'reservation'
      }, { transaction })
    }

    return createdHistory
  }

  async addProduct (productData, reservation, options) {
    const { productId } = productData

    const product = await productDomain.getById(productId)
    
    if (!product) {
      throw new Error('Product has not being found')
    }

    const quantity = product.hasSerialNumber ? 1 : productData.quantity

    if (!product.hasSerialNumber) {

      await ReservationProduct.create({
        productId: product.id,
        quantity: quantity,
        currentQuantity: quantity,
        reservationId: reservation.id,
      }, options)
  
    } else {
      const { productId, serialNumber } = productData
      const individualProduct = Boolean(serialNumber) ?
        await individualProductDomain.reserveByProductIdAndSerialNumber(
          productId,
          serialNumber,
          reservation.stockLocationId,
          options,
        )
        : await individualProductDomain.getAvailableIndividualProductAndReserve(
          productId,
          reservation.stockLocationId,
          options,
        )

      await ReservationProduct.create({
        productId: product.id,
        quantity: quantity,
        currentQuantity: quantity,
        reservationId: reservation.id,
        individualProductId: individualProduct.id
      }, options)

    }

    await stockDomain.add({
      stockLocationId: reservation.stockLocationId,
      productId: product.id,
      quantity: quantity * -1,
      originId: reservation.id,
      originType: 'reservation'
    }, options)
  }

  async release (releaseData, options = {}) {
    const { transaction } = options
    const reservation = await ReservationModel.findByPk(releaseData.id)

    for(const product of (releaseData.products || [])){
      await this.releaseProduct(product, reservation.id, { transaction })
    }

    await reservation.reload({
      transaction,
      include,
    })

    return reservation
  }

  async releaseProduct(productData, reservationId, { transaction } = options) {
    const product = await ReservationProduct.findByPk(productData.id)

    if(!product) {
      throw new Error('this reservation product does not exist')
    }

    if(product.reservationId !== reservationId) {
      throw new Error('this product does not belong to the given reservation id')
    }

    const quantity = Boolean(product.individualProductId) ? 1 : productData.quantity
    const newQuantity = product.currentQuantity - quantity
    
    if (newQuantity < 0 ){
      throw new Error('Current quantity is not enough for this release')
    }

    product.currentQuantity = newQuantity
  
    await product.save({
      transaction,
    })

    await HistoryModel.create({
      type: 'release',
      quantity: quantity,
      reservationProductId: product.id,
    }, { transaction })
  }

  async return (returnData, options = {}) {
    const { transaction } = options
    const reservation = await ReservationModel.findByPk(returnData.id)

    for(const product of (returnData.products || [])){
      await this.returnProduct(
        product,
        reservation.id,
        reservation.stockLocationId,
        { transaction }
      )
    }

    await reservation.reload({
      transaction,
      include,
    })

    return reservation
  }

  async returnProduct(productData, reservationId, stockLocationId, { transaction } = options) {
    const product = await ReservationProduct.findByPk(productData.id)

    if(!product) {
      throw new Error('this reservation product does not exist')
    }

    if(product.reservationId !== reservationId) {
      throw new Error('this product does not belong to the given reservation id')
    }

    const quantity = Boolean(product.individualProductId) ? 1 : productData.quantity
    const newQuantity = product.currentQuantity - quantity

    if (newQuantity < 0 ){
      throw new Error('Current quantity is not enough for this release')
    }

    product.currentQuantity = newQuantity
  
    await product.save({
      transaction,
    })

    if (product.individualProductId){
      individualProductDomain.makeAvailableById(product.individualProductId)
    }

    await HistoryModel.create({
      type: 'return',
      quantity: quantity,
      reservationProductId: product.id,
    }, { transaction })

    await stockDomain.add({
      stockLocationId,
      productId: product.productId,
      quantity: quantity,
      originId: reservationId,
      originType: 'reservation'
    }, { transaction })
  }

  async getById(id, { transaction } = {}) {
    return ReservationModel.findByPk(
      id,
      {
        transaction,
        include,
      }
    )
  }

}
  

module.exports = Reservation
