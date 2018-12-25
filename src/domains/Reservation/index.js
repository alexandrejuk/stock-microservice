const database = require('../../db')
const ProductDomain = require('../Product')
const StockDomain = require('../Stock')
const CustomerDomain = require('../Customer')
const IndividualProductDomain = require('../IndividualProduct')
const { FieldValidationError } = require('../../errors')

const ReservationModel = database.model('reservation')
const ReservationProduct = database.model('reservationProduct')
const ReservationIndividualProduct = database.model('reservationIndividualProduct')

const IndividualProductModel = database.model('individualProduct')
const ProductModel = database.model('product')
const StockLocationModel = database.model('stockLocation')
const CustomerModel = database.model('customer')
const HistoryModel = database.model('reservationProductHistory')
const IndividualHistoryModel = database.model('reservationIndividualProductHistory')

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
      }
    ],
  },
  {
    model: ReservationIndividualProduct,
    as: 'individualProducts',
    include: [
      {
        model: ProductModel,
        attributes: ['name', 'brand', 'sku','category']
      },
      IndividualProductModel,
      {
        model: IndividualHistoryModel,
        as: 'history'
      }
    ],
  },
]

class Reservation {
  async getAll() {
    return await ReservationModel.findAll({
      include,
    })
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

    for(const reservationProduct of reservationData.individualProducts) {
      await this.addIndividualProduct(
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

  async addProduct (productData, reservation, options) {
    const { productId, quantity } = productData

    const product = await productDomain.getById(productId)

    if (!product) {
      throw new Error('Product has not being found')
    }

    if (product.hasSerialNumber) {
      throw new Error('Product in reservation must not have serial numbers')
    }

    await ReservationProduct.create({
      productId: product.id,
      quantity: quantity,
      currentQuantity: quantity,
      reservationId: reservation.id,
    }, options)

    await stockDomain.add({
      stockLocationId: reservation.stockLocationId,
      productId: product.id,
      quantity: quantity * -1,
      originId: reservation.id,
      originType: 'reservation'
    }, options)
  }

  async addIndividualProduct(individualProductData, reservation, options) {
    const { individualProductId, productId } = individualProductData

    let individualProduct = null

    if (individualProductId) {
      individualProduct = await individualProductDomain.getById(individualProductId)

      if (!individualProduct) {
        throw new Error('IndividualProduct has not being found')
      }
  
      if (individualProduct.stockLocationId !== reservation.stockLocationId) {
        throw new Error('Stock location for individual product must be the same as the reservation')
      }

      await individualProductDomain.reserveById(individualProductId, options)
    } else {
      individualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(
        productId,
        reservation.stockLocationId,
        options,
      )
    }

    await ReservationIndividualProduct.create({
      individualProductId: individualProduct.id,
      productId,
      reservationId: reservation.id,
    }, options)

    await stockDomain.add({
      stockLocationId: reservation.stockLocationId,
      productId: productId,
      quantity: -1,
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

    for(const product of (releaseData.individualProducts || [])){
      await this.releaseIndividualProduct(product, reservation.id, { transaction })
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

    const newQuantity = product.currentQuantity - productData.quantity
    if (newQuantity < 0 ){
      throw new Error('Current quantity is not enough for this release')
    }

    product.currentQuantity = newQuantity
  
    await product.save({
      transaction,
    })

    await HistoryModel.create({
      type: 'release',
      quantity: productData.quantity,
      reservationProductId: product.id,
    }, { transaction })
  }

  async releaseIndividualProduct(individualProductData, reservationId, { transaction } = options) {
    const individualProduct = await ReservationIndividualProduct
      .findByPk(
        individualProductData.id,
        {
          include: [IndividualProductModel]
        }
      )

    if(!individualProduct) {
      throw new Error('this reservation product does not exist')
    }

    if(!individualProduct.available) {
      throw new Error('this product has already being released of returned')
    }

    individualProduct.available = false
  
    await individualProduct.save({
      transaction,
    })

    await IndividualHistoryModel.create({
      type: 'release',
      reservationIndividualProductId: individualProduct.id,
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

    for(const product of (returnData.individualProducts || [])){
      await this.returnIndividualProduct(
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

    const newQuantity = product.currentQuantity - productData.quantity
    if (newQuantity < 0 ){
      throw new Error('Current quantity is not enough for this release')
    }

    product.currentQuantity = newQuantity
  
    await product.save({
      transaction,
    })

    await HistoryModel.create({
      type: 'return',
      quantity: productData.quantity,
      reservationProductId: product.id,
    }, { transaction })

    await stockDomain.add({
      stockLocationId,
      productId: product.productId,
      quantity: productData.quantity,
      originId: reservationId,
      originType: 'reservation'
    }, { transaction })
  }

  async returnIndividualProduct(individualProductData, reservationId, stockLocationId, { transaction } = options) {
    const individualProduct = await ReservationIndividualProduct
      .findByPk(
        individualProductData.id,
      )

    if(!individualProduct) {
      throw new Error('this reservation product does not exist')
    }

    if(!individualProduct.available) {
      throw new Error('this product has already being released of returned')
    }

    individualProduct.available = false
  
    await individualProduct.save({
      transaction,
    })

    await IndividualHistoryModel.create({
      type: 'return',
      reservationIndividualProductId: individualProduct.id,
    }, { transaction })

    await individualProductDomain.makeAvailableById(
      individualProduct.individualProductId,
      { transaction }
    )

    await stockDomain.add({
      stockLocationId,
      productId: individualProduct.productId,
      quantity: 1,
      originId: reservationId,
      originType: 'reservation'
    }, { transaction })
  }

}
  

module.exports = Reservation
