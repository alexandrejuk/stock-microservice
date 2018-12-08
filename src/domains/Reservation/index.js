const database = require('../../db')
const ProductDomain = require('../Product')
const StockDomain = require('../Stock')
const IndividualProductDomain = require('../IndividualProduct')
const { FieldValidationError } = require('../../errors')

const ReservationModel = database.model('reservation')
const ProductModel = database.model('product')
const StockLocationModel = database.model('stockLocation')
const IndividualProductModel = database.model('individualProduct')
const ReservationItemModel = database.model('reservationItem')

const productDomain = new ProductDomain()
const individualProductDomain = new IndividualProductDomain()
const stockDomain = new StockDomain()

const include = [{
  model: ReservationItemModel,
  as: 'items',
  include: [
    {
      model: ProductModel,
      attributes: ['name', 'brand', 'sku','category']
    },
    {
      model: IndividualProductModel,
      attributes: ['serialNumber']
    },
    {
      model: StockLocationModel,
      attributes: ['name']
    },
  ],
}]

class Reservation {
  async getAll() {
    return await ReservationModel.findAll({
      include,
    })
  }

  async getById(id) {
    return await ReservationModel.findByPk(id, { include });
  }

  async update (reservationData, options = {}) {
    const { transaction } = options

    const {
      id,
      items = [],
      status,
    } = reservationData

    const reservation = await ReservationModel.findByPk(id)

    for(const productReservationData of items){
      this.updateProductReservation(productReservationData, id, { transaction })
    }

    if(reservation.status === 'reservado' && status === 'liberado') {
      reservation.releasedAt = new Date();
      await reservation.save()
    }

    reservation.reload({
      transaction,
      include,
    })

    return reservation
  }

  async updateProductReservation (productReservationData, reservationId, options = {}) {
    const { transaction } = options

    const productReservation = await ReservationItemModel.findOne({
      where: {
        id: productReservationData.id,
        reservationId,
      },
      include: include[0].include,
    })

    if(productReservationData.currentQuantity !== productReservation.currentQuantity){
      if(productReservationData.currentQuantity > productReservation.currentQuantity) {
        const quantityToBeReserved = productReservationData.currentQuantity - productReservation.currentQuantity
        const quantityAvailableInStock = await stockDomain.getProductQuantity(
          productReservation.productId,
          productReservation.stockLocationId,
        )

        if (quantityToBeReserved > quantityAvailableInStock) {
          throw new FieldValidationError([{
            name: 'quantity',
            message: `You are trying to reserve ${quantityToBeReserved} but there is only ${quantityAvailableInStock}`
          }])
        }
    
        if(productReservation.individualProductId !== null) {
          if(productReservation.currentQuantity === 1) {
            try {
              await individualProductDomain.reserveById(productReservation.individualProductId)
            } catch (error) {
              const individualProduct = await individualProductDomain
                .getAvailableIndividualProductAndReserve(
                  productReservation.productId,
                  productReservation.stockLocationId,
                  { transaction }
                )
              
              productReservation.individualProductId = individualProduct.id,
              productReservation.currentQuantity = productReservationData.currentQuantity,
              await productReservation.save()
            }
          } else {
            throw new FieldValidationError([{
              name: 'currentQuantity',
              message: `Current quantity for product reservation that has individual product cannot be
              greater than 1`,
            }])
          }
        } else {
          productReservation.currentQuantity = productReservationData.currentQuantity,
          await productReservation.save()
        }

        await stockDomain.add({
          stockLocationId: productReservation.stockLocationId,
          quantity: quantityToBeReserved * -1,
          productId: productReservation.productId,
          originId: reservationId,
          originType: 'reservation',
          description: 'reservation registration'
        })
      } else {
        const quantityToBeReturned = productReservation.currentQuantity - productReservationData.currentQuantity 
        
        if(productReservation.individualProductId !== null) {
          await individualProductDomain.makeAvailableById(productReservation.individualProductId)
        }

        productReservation.currentQuantity = productReservationData.currentQuantity,
        await productReservation.save()

        await stockDomain.add({
          stockLocationId: productReservation.stockLocationId,
          quantity: quantityToBeReturned,
          productId: productReservation.productId,
          originId: reservationId,
          originType: 'reservation',
          description: 'reservation registration'
        })
      }
    }
  }

  async add (reservationData, options = {}) {
    const { transaction } = options

    const createdReservation = await ReservationModel.create(
      reservationData,
      { transaction },
    )

    for(const reservationProduct of reservationData.items) {
      await this.addProductReservation(reservationProduct, createdReservation.id, options)
    }
    
    await createdReservation.reload({
      transaction,
      include,
    })

    return createdReservation
  }

  async addProductReservation(productReservationData, reservationId, options) {
    const { transaction } = options
    const { productId, quantity, stockLocationId } = productReservationData
    const product = await productDomain.getById(productId)
    
    /**
     * If the product does not have serial number, we just add the quantity that was reserved, otherwise,
     * we need to check if there is an available individual product for that serial number 
     */
    if (!product.hasSerialNumber) {
      await ReservationItemModel.create({
        productId,
        stockLocationId,
        quantity,
        currentQuantity: quantity,
        reservationId,
      }, { transaction })
    } else { 
      for(let i = 0; i < quantity; i++){
        const individualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(
          productId,
          stockLocationId,
          { transaction }
        )
    
        await ReservationItemModel.create({
          productId,
          quantity: 1,
          stockLocationId,
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
    }, { transaction })
  }
}

module.exports = Reservation
