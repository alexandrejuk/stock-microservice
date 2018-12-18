const database = require('../../db')
const ProductDomain = require('../Product')
const StockDomain = require('../Stock')
const CustomerDomain = require('../Customer')
const IndividualProductDomain = require('../IndividualProduct')
const { FieldValidationError } = require('../../errors')

const ReservationModel = database.model('reservation')
const ProductModel = database.model('product')
const StockLocationModel = database.model('stockLocation')
const IndividualProductModel = database.model('individualProduct')
const ReservationItemModel = database.model('reservationItem')
const HistoryModel = database.model('reservationItemHistory') 
const ReservationItemIndividualProductModel = database.model('reservationItemIndividualProduct')
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

    for(const reservationProduct of reservationData.items) {
      await this.addItem(
        reservationProduct,
        createdReservation.id,
        createdReservation.stockLocationId,
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

      await item.addIndividualProducts(individualProducts, { transaction })
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
