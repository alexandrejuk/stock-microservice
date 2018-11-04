const expect = require('expect');
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

describe('add', () => {
  beforeEach(async () => {
    const stockLocation = await stockLocationDomain.add(mocks.stockLocation())
    const product = await productDomain.add(mocks.product({
      hasSerialNumber: true
    }))

    await stockDomain.add({
      productId: product.id,
      quantity: 10,
      stockLocationId: stockLocation.id
    })

    await individualProductDomain.addMany({

    })


  })

  describe('add with correct data', () => {

  })
})
