const ReservationDomain = require('./index')
const StockDomain = require('../Stock')
const StockLocationDomain = require('../StockLocation')
const ProductDomain = require('../Product')
const IndividualProductDomain = require('../IndividualProduct')
const mocks = require('../../helpers/mocks')
const randomDataGenerator = require('../../helpers/randomDataGenerator')

const reservationDomain = new ReservationDomain()
const stockDomain = new StockDomain()
const stockLocationDomain = new StockLocationDomain()
const productDomain = new ProductDomain()
const individualProductDomain = new IndividualProductDomain()

let stockLocationId = null
let productWihoutSerialNumberId = null
let productWithSerialNumberId = null

beforeAll(async () => {
  const stockLocation = await stockLocationDomain.add(mocks.stockLocation())
  stockLocationId = stockLocation.id

  const productWidhoutSerialNumber = await productDomain.add(mocks.product({
    hasSerialNumber: false,
  }))
  productWihoutSerialNumberId = productWidhoutSerialNumber.id

  const productWithSerialNumber = await productDomain.add(mocks.product({
    hasSerialNumber: true,
  }))
  productWithSerialNumberId = productWithSerialNumber.id

  await stockDomain.add({
    productId: productWihoutSerialNumberId,
    quantity: 100,
    stockLocationId: stockLocation.id
  })

  await stockDomain.add({
    productId: productWithSerialNumberId,
    quantity: 100,
    stockLocationId: stockLocation.id
  })

  individualProductData = {
    productId: productWithSerialNumberId,
    originId: null,
    originType: null,
    stockLocationId,
    serialNumbers: [
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
      randomDataGenerator(),
    ]
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


