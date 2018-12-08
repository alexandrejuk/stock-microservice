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
const HistoryModel = database.model('reservationItemHistory') 
const ReservationItemIndividualProductModel = database.model('reservationItemIndividualProduct')

const productDomain = new ProductDomain()
const individualProductDomain = new IndividualProductDomain()
const stockDomain = new StockDomain()

const include = [
  {
    model: StockLocationModel,
    attributes: ['name']
  },
  {
    model: ReservationItemModel,
    as: 'items',
    include: [
      {
        model: ProductModel,
        attributes: ['name', 'brand', 'sku','category']
      },
      {
        model: IndividualProductModel,
        // attributes: ['serialNumber']
      },
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

  async update (reservationData, options = {}) {
    const { transaction } = options

    const {
      id,
      items = [],
      status,
    } = reservationData

    const reservation = await ReservationModel.findByPk(id)

    for(const itemData of items){
      this.updateProductReservation(itemData, id, { transaction })
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

  async updateProductReservation (itemData, reservationId, options = {}) {
    const { transaction } = options

    const productReservation = await ReservationItemModel.findOne({
      where: {
        id: itemData.id,
        reservationId,
      },
      include: include[0].include,
    })

    if(itemData.currentQuantity !== productReservation.currentQuantity){
      if(itemData.currentQuantity > productReservation.currentQuantity) {
        const quantityToBeReserved = itemData.currentQuantity - productReservation.currentQuantity
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
              productReservation.currentQuantity = itemData.currentQuantity,
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
          productReservation.currentQuantity = itemData.currentQuantity,
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
      await this.addItem(
        reservationProduct,
        createdReservation.id,
        createdReservation.stockLocationId,
        options,
      )
    }
    
    await createdReservation.reload({
      transaction,
      include,
    })

    return createdReservation
  }

  async release (reservationData) {
    const reservation = ReservationModel
      .findByPk(reservationData.id)

    for(const item of reservationData.items){
      await this.releaseItem(item, reservationData)
    }
  }

  async releaseItem (itemData, type) {
    const item = await ReservationItemModel.findByPk(itemData.id)
    const product = await productDomain.getById(item.productId)
    console.log(JSON.stringify(product))

    const currentQuantity = item.currentQuantity - itemData.quantity

    if(currentQuantity < 0){
      throw new Error('Quantity available is not sufficient for this release')
    }

    const history = await HistoryModel.create({
      reservationItemId: itemData.id,
      quantity: itemData.quantity,
      type: 'release',
    })

    item.currentQuantity = currentQuantity
    await item.save()

    if(product.hasSerialNumber) {
      const { individualProducts = [] } = itemData
      if(itemData.quantity !== individualProducts.length){
        throw new Error('The number you are trying to release needs to be the same as the individualProducts')
      }

      for(const productIndividualId of individualProducts) {
        const individualProduct = await ReservationItemIndividualProductModel.findByPk(
          productIndividualId,
        )
  
        if (individualProduct.reservationItemId !== itemData.id) {
          throw new Error('This individual product does not belong to this reservation')
        }
  
        if (!individualProduct.available) {
          throw new Error('This individual product is no longer available')
        }
    
        individualProduct.available = false
  
        await history.addReservationItemIndividualProduct(individualProduct.id)
        await individualProduct.save()
      }
    }
  }

  async addItem(itemData, reservationId, stockLocationId, options) {
    const { transaction } = options
    const { productId, quantity } = itemData
    const product = await productDomain.getById(productId)
    
    const item = await ReservationItemModel.create({
      productId,
      quantity,
      currentQuantity: quantity,
      reservationId,
    }, { transaction })
  
    /**
     * If the product does not have serial number, we just add the quantity that was reserved, otherwise,
     * we need to check if there is an available individual product for that serial number 
     */
    if (product.hasSerialNumber) {
      const individualProducts = []
      for(let i = 0; i < quantity; i++){
        const individualProduct = await individualProductDomain.getAvailableIndividualProductAndReserve(
          productId,
          stockLocationId,
          { transaction }
        )

        individualProducts.push(
          individualProduct.id,
        )
      }

      item.addIndividualProducts(individualProducts)
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
