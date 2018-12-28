const ReservationDomain = require('./index')
const mocks = require('../../helpers/mocks')
const randomDataGenerator = require('../../helpers/randomDataGenerator')
const database = require('../../db')
const StockDomain = require('./../Stock')
const CustomerDomain = require('../Customer')

const IndividualProductModel = database.model('individualProduct')
const StockLocationModel = database.model('stockLocation')
const ProductModel = database.model('product')
const StockModel = database.model('stock')
const ReservationProductModel = database.model('reservationProduct')
const HistoryModel = database.model('reservationProductHistory')


const reservationDomain = new ReservationDomain()
const stockDomain = new StockDomain()
const customerDomain = new CustomerDomain()

let stockLocation = null
let productSN = null
let product = null
const numberOfProducts = 100
let individualProducts = null
const cnpj = "06062933000190"
let customer = null

beforeAll(async () => {
  stockLocation = await StockLocationModel.create(mocks.stockLocation())

  product = await ProductModel.create(mocks.product({
    hasSerialNumber: false,
  }))

  customer = await customerDomain.getByDocumentNumber(cnpj)

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

describe('add new reservation', async () => {
  test('should register a new reservation', async () => {
    const reservation = await reservationDomain.add({
      reservedAt: new Date,
      stockLocationId: stockLocation.id,
      customerId: customer.id,
      products: [
        {
          quantity: 2,
          productId: product.id,
        },
        {
          productId: productSN.id,
        }
      ],
    })

    expect(reservation).toBeTruthy()
    expect(reservation.products).toHaveLength(2)
  })

  test('should register a new reservation if the specific serialNumber', async () => {
    const serialNumber = randomDataGenerator()
    const individualProduct = await IndividualProductModel.create({
      stockLocationId: stockLocation.id,
      productId: productSN.id,
      serialNumber, 
      available: true,
    })

    const reservation = await reservationDomain.add({
      reservedAt: new Date,
      stockLocationId: stockLocation.id,
      customerId: customer.id,
      products: [
        {
          productId: productSN.id,
          serialNumber,
        }
      ],
    })

    await individualProduct.reload()

    expect(reservation).toBeTruthy()
    expect(reservation.products[0].productId).toBe(productSN.id)
    expect(reservation.products[0].quantity).toBe(1)
    expect(individualProduct.available).toBe(false)
  })
})

describe('release reservation', () => {
  let reservationData = null
  const reserveQuantity = 10
  const releaseQuantity = 5
  let reservation = null

  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      stockLocationId: stockLocation.id,
      customerId: customer.id,
      products: [
        {
          quantity: reserveQuantity,
          productId: product.id,
        },
        {
          quantity: reserveQuantity,
          productId: productSN.id,
        },
      ],
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should release specified quantity of a product', async () => {
    const prod = reservation.products.find(p => p.individualProductId === null)

    await reservationDomain.release({
      id: reservation.id,
      products: [{
        id: prod.id,
        quantity: releaseQuantity,
      }]
    })

    const reservationProduct = await ReservationProductModel.findByPk(
      prod.id,
      {
        include: [{
          model: HistoryModel,
          as: 'history',
        }]
      }
    )

    expect(reservationProduct.currentQuantity).toBe(reserveQuantity - releaseQuantity)
    expect(reservationProduct.history).toHaveLength(1)
    expect(reservationProduct.history[0].quantity).toBe(releaseQuantity)
    expect(reservationProduct.history[0].type).toBe('release')
  })

  test('should release 1 for individual product', async () => {
    const prod = reservation.products.find(p => p.individualProductId !== null)

    await reservationDomain.release({
      id: reservation.id,
      products: [{
        id: prod.id,
      }]
    })

    const reservationProduct = await ReservationProductModel.findByPk(
      prod.id,
      {
        include: [{
          model: HistoryModel,
          as: 'history',
        }]
      }
    )

    expect(reservationProduct.currentQuantity).toBe(0)
    expect(reservationProduct.history).toHaveLength(1)
    expect(reservationProduct.history[0].quantity).toBe(1)
    expect(reservationProduct.history[0].type).toBe('release')
  })
})


describe('return reservation', () => {
  let reservationData = null
  const reserveQuantity = 10
  const returnQuantity = 5
  let reservation = null

  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      stockLocationId: stockLocation.id,
      customerId: customer.id,
      products: [
        {
          quantity: reserveQuantity,
          productId: product.id,
        },
        {
          productId: productSN.id,
        },
      ],
      individualProducts: [
        {
          productId: productSN.id,
        },
      ] 
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should return specified quantity of a product', async () => {
    const prod = reservation.products.find(p => p.individualProductId === null)
    const productId = prod.id

    await reservationDomain.return({
      id: reservation.id,
      products: [{
        id: productId,
        quantity: returnQuantity,
      }]
    })

    const reservationProduct = await ReservationProductModel.findByPk(
      productId,
      {
        include: [{
          model: HistoryModel,
          as: 'history',
        }]
      }
    )

    expect(reservationProduct.currentQuantity).toBe(reserveQuantity - returnQuantity)
    expect(reservationProduct.history).toHaveLength(1)
    expect(reservationProduct.history[0].quantity).toBe(returnQuantity)
    expect(reservationProduct.history[0].type).toBe('return')
  })

  test('should return individual product', async () => {
    const prod = reservation.products.find(p => p.individualProductId !== null)
    const productId = prod.id

    await reservationDomain.return({
      id: reservation.id,
      products: [{
        id: productId,
        quantity: returnQuantity,
      }]
    })

    const reservationProduct = await ReservationProductModel.findByPk(
      productId,
      {
        include: [
          {
          model: HistoryModel,
          as: 'history',
          },
          IndividualProductModel,
        ],
      }
    )

    expect(reservationProduct.currentQuantity).toBe(0)
    expect(reservationProduct.history).toHaveLength(1)
    expect(reservationProduct.history[0].quantity).toBe(1)
    expect(reservationProduct.history[0].type).toBe('return')

    expect(reservationProduct.individualProduct.available).toBe(true)
  })
})

describe('getById', () => {
  let reservationData = null
  const reserveQuantity = 10
  const returnQuantity = 5
  let reservation = null

  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      stockLocationId: stockLocation.id,
      customerId: customer.id,
      products: [
        {
          quantity: reserveQuantity,
          productId: product.id,
        },
        {
          productId: productSN.id,
        },
      ],
    }

    const createdReservation = await reservationDomain.add(reservationData)

    reservation = await reservationDomain.getById(createdReservation.id)
  })

  test('should have customer', () => {
    expect(reservation.customer).toBeTruthy()
    expect(reservation.customer.mainId).toBe(cnpj)
  })

  describe('products', () => {
    test('should have 1 product', () => {
      expect(reservation.products).toHaveLength(2)
    })
  })
})

describe('deleteHistory', () => {
  let reservationData = null
  let reservation = null

  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      stockLocationId: stockLocation.id,
      customerId: customer.id,
      products: [
        {
          productId: productSN.id,
        },
        {
          productId: productSN.id,
        },
      ],
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should cancel the release of a given item',  async () => {
    const reservationProductId = reservation.products[0].id

    await reservationDomain.release({
      id: reservation.id,
      products: [
        {
          id: reservationProductId,
        }
      ]
    })

    const historyToCancel = await HistoryModel.findOne({ where: {
      reservationProductId
    }})

    const cancelHistory = await reservationDomain.deleteHistory(historyToCancel.id)
    

    expect(cancelHistory.type).toBe('cancel')
    expect(cancelHistory.quantity).toBe(historyToCancel.quantity)
    expect(cancelHistory.reservationProductId).toBe(reservationProductId)
  })

  test('should cancel the return of a given item',  async () => {
    const reservationProductId = reservation.products[1].id

    await reservationDomain.return({
      id: reservation.id,
      products: [
        {
          id: reservationProductId,
        }
      ]
    })

    const historyToCancel = await HistoryModel.findOne({ where: {
      reservationProductId
    }})

    const cancelHistory = await reservationDomain.deleteHistory(historyToCancel.id)

    expect(cancelHistory.type).toBe('cancel')
    expect(cancelHistory.quantity).toBe(historyToCancel.quantity)
    expect(cancelHistory.reservationProductId).toBe(reservationProductId)
  })
})