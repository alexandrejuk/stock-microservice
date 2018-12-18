const ReservationDomain = require('./index')
const mocks = require('../../helpers/mocks')
const randomDataGenerator = require('../../helpers/randomDataGenerator')
const database = require('../../db')
const StockDomain = require('./../Stock')
const IndividualProductModel = database.model('individualProduct')
const StockLocationModel = database.model('stockLocation')
const ProductModel = database.model('product')
const StockModel = database.model('stock')
const CustomerDomain = require('../Customer')

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

describe('created a new reservation', async () => {
  let reservation = null
  let reservationData = null
  let reserveQuantity = 2

  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      stockLocationId: stockLocation.id,
      customerId: customer.id,
      items: [
        {
          quantity: reserveQuantity,
          productId: product.id,
        },
        {
          quantity: reserveQuantity,
          productId: productSN.id,
        },
      ]
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should register a new reservation', async () => {
    expect(reservation).toBeTruthy()
    expect(reservation.items).toHaveLength(2)
  })

  test('should reserve the quantity that was passed', () => {
    for (const item of reservation.items) {
      const itemData = reservationData.items.find(({ productId }) => productId === item.productId)

      expect(item.quantity).toBe(itemData.quantity)
      if(item.productId === productSN.id){
        expect(item.individualProducts).toHaveLength(reserveQuantity)
      }
    }
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
  let reserveQuantity = 2

  beforeAll(async () => {
    reservationData = {
      reservedAt: new Date,
      stockLocationId: stockLocation.id,
      customerId: customer.id,
      items: [
        {
          quantity: reserveQuantity,
          productId: product.id,
        },
        {
          quantity: reserveQuantity,
          productId: productSN.id,
        },
      ]
    }

    reservation = await reservationDomain.add(reservationData)
  })

  test('should register a new reservation', async () => {
    const itemWithSerialNumber = reservation.items[1]
    const itemWithoutSerialNumber = reservation.items[0]

    await reservationDomain.release({
      id: reservation.id,
      type: 'return',
      items: [
        {
          id: itemWithSerialNumber.id,
          quantity: 2,
          individualProducts: [
            itemWithSerialNumber.individualProducts[0].reservationItemIndividualProduct.id,
            itemWithSerialNumber.individualProducts[1].reservationItemIndividualProduct.id
          ]
        },
        {
          id: itemWithoutSerialNumber.id,
          quantity: 2,
        }
      ]
    })
  })
})

// describe('return reservation', async () => {
//   let reservation = null
//   let reservationData = null
//   let reserveQuantity = 2

//   beforeAll(async () => {
//     reservationData = {
//       reservedAt: new Date,
//       stockLocationId: stockLocation.id,
//       customerId: customer.id,
//       items: [
//         {
//           quantity: reserveQuantity,
//           productId: product.id,
//         },
//         {
//           quantity: reserveQuantity,
//           productId: productSN.id,
//         },
//       ]
//     }

//     reservation = await reservationDomain.add(reservationData)
//   })

//   test('should return items of a reservation', async () => {
//     const itemWithSerialNumber = reservation.items[1]
//     const itemWithoutSerialNumber = reservation.items[0]

//     await reservationDomain.return({
//       id: reservation.id,
//       type: 'return',
//       items: [
//         {
//           id: itemWithSerialNumber.id,
//           quantity: 2,
//           individualProducts: [
//             itemWithSerialNumber.individualProducts[0].reservationItemIndividualProduct.id,
//             itemWithSerialNumber.individualProducts[1].reservationItemIndividualProduct.id
//           ]
//         },
//         {
//           id: itemWithoutSerialNumber.id,
//           quantity: 2,
//         }
//       ]
//     })
//   })
// })



