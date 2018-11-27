const ReservationDomain = require('./index')
const mocks = require('../../helpers/mocks')
const randomDataGenerator = require('../../helpers/randomDataGenerator')
const database = require('../../db')

const IndividualProductModel = database.model('individualProduct')
const StockLocationModel = database.model('stockLocation')
const ProductModel = database.model('product')
const StockModel = database.model('stock')

const reservationDomain = new ReservationDomain()

let stockLocation = null
let productSN = null
let product = null
const nSerialNumber = 50
let individualProducts = null

beforeAll(async () => {
  stockLocation = await StockLocationModel.create(mocks.stockLocation())

  product = await ProductModel.create(mocks.product({
    hasSerialNumber: false,
  }))

  productSN = await ProductModel.create(mocks.product({
    hasSerialNumber: true,
  }))

  await StockModel.create({
    productId: product.id,
    quantity: 100,
    stockLocationId: stockLocation.id
  })

  await StockModel.create({
    productId: product.id,
    quantity: nSerialNumber,
    stockLocationId: stockLocation.id
  })

  const individualProductData = []
  for(let i =0; i < nSerialNumber; i++){
    individualProductData.push({
      stockLocationId: stockLocation.id,
      productId: productSN.id,
      serialNumber: randomDataGenerator(), 
      available: true,
    })
  }

  individualProducts =  await IndividualProductModel.bulkCreate(individualProductData)
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
          productId: product.id,
          stockLocationId: stockLocation.id,
        },
        {
          quantity: 5,
          productId: productSN.id,
          stockLocationId: stockLocation.id,
        },
      ]
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should register a new reservation', async () => {
    expect(reservation).toBeTruthy()
    expect(reservation.productReservations).toHaveLength(6)
  })

  // test('should remove from stock the same quantity that was reserved', async () => {
  //   const quantity = await stockDomain.getProductQuantity(productWihoutSerialNumberId, stockLocationId)

  //   expect(quantity).toBe(50)
  // })
})


