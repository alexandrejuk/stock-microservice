const ReservationDomain = require('./index')
const mocks = require('../../helpers/mocks')
const randomDataGenerator = require('../../helpers/randomDataGenerator')
const database = require('../../db')
const StockDomain = require('./../Stock')
const IndividualProductModel = database.model('individualProduct')
const StockLocationModel = database.model('stockLocation')
const ProductModel = database.model('product')
const StockModel = database.model('stock')

const reservationDomain = new ReservationDomain()
const stockDomain = new StockDomain()

let stockLocation = null
let productSN = null
let product = null
const numberOfProducts = 100
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
    quantity: numberOfProducts,
    stockLocationId: stockLocation.id
  })

  await StockModel.create({
    productId: productSN.id,
    quantity: numberOfProducts,
    stockLocationId: stockLocation.id
  })

  const individualProductData = Array(numberOfProducts)
    .fill(0)
    .map(() => ({
      stockLocationId: stockLocation.id,
      productId: productSN.id,
      serialNumber: randomDataGenerator(), 
      available: true,
    }))

  individualProducts =  await IndividualProductModel.bulkCreate(individualProductData)
})

describe('created a new reservation', async () => {
  let reservation = null
  let reservationData = null
  let reserveQuantity = 40

  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      items: [
        {
          quantity: reserveQuantity,
          productId: product.id,
          stockLocationId: stockLocation.id,
        },
        {
          quantity: reserveQuantity,
          productId: productSN.id,
          stockLocationId: stockLocation.id,
        },
      ]
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should register a new reservation', async () => {
    expect(reservation).toBeTruthy()
    expect(reservation.items).toHaveLength(reserveQuantity + 1)
  })

  test('should remove from stock the same quantity that was reserved', async () => {
    const quantity = await stockDomain.getProductQuantity(product.id, stockLocation.id)
    const quantitySN = await stockDomain.getProductQuantity(productSN.id, stockLocation.id)

    expect(quantity).toBe(numberOfProducts - reserveQuantity)
    expect(quantitySN).toBe(numberOfProducts - reserveQuantity)

  })
})

describe('release a reservation', async () => {
  let reservation = null
  let reservationData = null
  let reserveQuantity = 40

  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      items: [
        {
          quantity: reserveQuantity,
          productId: product.id,
          stockLocationId: stockLocation.id,
        },
        {
          quantity: reserveQuantity,
          productId: productSN.id,
          stockLocationId: stockLocation.id,
        },
      ]
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should register a new reservation', async () => {
    expect(reservation).toBeTruthy()
    expect(reservation.items).toHaveLength(reserveQuantity + 1)
  })
})




