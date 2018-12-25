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
const ReservationIndividualProductModel = database.model('reservationIndividualProduct')
const HistoryModel = database.model('reservationProductHistory')
const IndividualHistoryModel = database.model('reservationIndividualProductHistory')

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
  let reservationData = null
  let reserveQuantity = 2

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
      ],
      individualProducts: [
        {
          productId: productSN.id,
        },
      ] 
    }
  })

  test('should register a new reservation', async () => {
    const reservation = await reservationDomain.add(reservationData)

    expect(reservation).toBeTruthy()
    expect(reservation.products).toHaveLength(1)
    expect(reservation.individualProducts).toHaveLength(1)
  })


  test('should throw error if product has serial number', async () => {
    return await expect(
      reservationDomain.add({
        ...reservationData,
        products: [
          ...reservationData.products,
          {
            quantity: 2,
            productId: productSN.id,
          },
        ]
      }),
    ).rejects.toThrow()
  })

  test('should throw error if a individual product does not have serial number', async () => {
    return await expect(
      reservationDomain.add({
        ...reservationData,
        individualProducts: [
          {
            productId: product.id,
          },
        ]
      }),
    ).rejects.toThrow()
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
      ],
      individualProducts: [
        {
          productId: productSN.id,
        },
      ] 
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should release specified quantity of a product', async () => {
    const productId = reservation.products[0].id

    await reservationDomain.release({
      id: reservation.id,
      products: [{
        id: productId,
        quantity: releaseQuantity,
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

    expect(reservationProduct.currentQuantity).toBe(reserveQuantity - releaseQuantity)
    expect(reservationProduct.history).toHaveLength(1)
    expect(reservationProduct.history[0].quantity).toBe(releaseQuantity)
    expect(reservationProduct.history[0].type).toBe('release')
  })

  test('should release specified individual product', async () => {
    const productId = reservation.individualProducts[0].id

    await reservationDomain.release({
      id: reservation.id,
      individualProducts: [{
        id: productId,
      }]
    })

    const reservationProduct = await ReservationIndividualProductModel.findByPk(
      productId,
      {
        include: [{
          model: IndividualHistoryModel,
          as: 'history',
        }]
      }
    )

    expect(reservationProduct.available).toBe(false)
    expect(reservationProduct.history).toHaveLength(1)
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
    const productId = reservation.products[0].id

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

  test('should return specified individual product', async () => {
    const productId = reservation.individualProducts[0].id

    await reservationDomain.return({
      id: reservation.id,
      individualProducts: [{
        id: productId,
      }]
    })

    const reservationProduct = await ReservationIndividualProductModel.findByPk(
      productId,
      {
        include: [{
          model: IndividualHistoryModel,
          as: 'history',
        }]
      }
    )

    const individualProduct = await IndividualProductModel.findByPk(
      reservationProduct.individualProductId
    )

    expect(individualProduct.available).toBe(true)
  })
})