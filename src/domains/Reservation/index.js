const database = require('../../db')
const ProductDomain = require('../Product')
const StockDomain = require('../Stock')
const IndividualProductDomain = require('../IndividualProduct')

const ReservationModel = database.model('reservation')
const ProductModel = database.model('product')
const StockLocationModel = database.model('stockLocation')
const IndividualProductModel = database.model('individualProduct')
const ProductReservationModel = database.model('productReservation')

const productDomain = new ProductDomain()
const individualProductDomain = new IndividualProductDomain()
const stockDomain = new StockDomain()

class Reservation {
  async add (reservationData, options = {}) {
    const { transaction } = options

    const createdReservation = await ReservationModel.create(
      reservationData,
      { transaction },
    )

    for(const reservationProduct of reservationData.productReservations) {
      await this.addProductReservation(reservationProduct, createdReservation.id, options)
    }
    
    return createdReservation.reload({
      transaction,
      include: [{
        model: ProductReservationModel,
        include: [
          ProductModel,
          IndividualProductModel,
          StockLocationModel,
        ],
      }]
    })
  }

  async addProductReservation(productReservationData, reservationId, options) {
    const { transaction } = options
    const { productId, quantity, stockLocationId } = productReservationData
    const product = await productDomain.getById(productId)
    
    if(!product.hasSerialNumber){
      await ProductReservationModel.create({
        ...productReservationData,
        currentQuantity: quantity,
        reservationId,
      }, { transaction })
    } else {
      for(let i = 0; i < quantity; i++){
        const individualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(
          productId,
          stockLocationId
        )
    
        await ProductReservationModel.create({
          ...productReservationData,
          quantity: 1,
          currentQuantity: 1,
          reservationId,
          individualProductId: individualProduct.id,
        }, { transaction })
      }
    }

    await stockDomain.add({
      stockLocationId,
      quantity: quantity * -1,
      productId,
      originId: reservationId,
      originType: 'reservation',
      description: 'reservation registration'
    })
  }
}

module.exports = Reservation
