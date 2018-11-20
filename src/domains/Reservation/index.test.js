const ReservationDomain = require('./index')
const mocks = require('../../helpers/mocks')
const randomDataGenerator = require('../../helpers/randomDataGenerator')
const database = require('../../db')

const IndividualProductModel = database.model('individualProduct')
const StockLocationModel = database.model('stockLocation')
const ProductModel = database.model('product')

let stockLocation = null
let productSN = null
let product = null
const nSerialNumber = 50
const individualProducts = []

beforeAll(async () => {
  stockLocation = await StockLocationModel.create(mocks.stockLocation())

  product = await ProductModel.create(mocks.product({
    hasSerialNumber: false,
  }))

  productSN = await productDomain.add(mocks.product({
    hasSerialNumber: true,
  }))

  await stockDomain.add({
    productId: product.id,
    quantity: 100,
    stockLocationId: stockLocation.id
  })

  await productWS.add({
    productId: productSN.id,
    quantity: 100,
    stockLocationId: stockLocation.id
  })

  for(let i =0; i < nSerialNumber; i++){
    const individualProduct = await IndividualProductModel.create({
      productId: productWS,
      stockLocationId: stockLocation.id,
      serialNumber: randomDataGenerator
    })
  }

  await individualProductDomain.addMany(individualProductData)
})

describe('created a new reservation', async () => {
  let reservation = null
  let reservationData = null
  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      productReservations: [
        {
          quantity: 50,
          productId: productWihoutSerialNumberId,
          stockLocationId,
        },
        {
          quantity: 5,
          productId: productWithSerialNumberId,
          stockLocationId,
        },
      ]
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should register a new reservation', async () => {
    expect(reservation).toBeTruthy()
    expect(reservation.productReservations).toHaveLength(6)
  })

  test('should remove from stock the same quantity that was reserved', async () => {
    const quantity = await stockDomain.getProductQuantity(productWihoutSerialNumberId, stockLocationId)

    expect(quantity).toBe(50)
  })
})


