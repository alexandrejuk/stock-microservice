const test = require('ava')
const StockLocation = require('./')
const databaseHelper = require('../../helpers/database')

const stockLocationDomain = new StockLocation()

test.before(databaseHelper.isDatabaseConnected)

test('Should be a stockLocation instance', t => {
  const stockLocationDomain = new StockLocation()
  t.true(stockLocationDomain instanceof StockLocation)
})

test('Should add a new stockLocaton', async t => {
  const stockLocationData = { name: 'amazon' }
  const createdStockLocation = await stockLocationDomain.add(stockLocationData)
  t.is(stockLocationData.name.toUpperCase(),  createdStockLocation.name)
})

test('Should find a stock location by its id', async t => {
  const stockLocationData = { name: 'amazon' }
  const createdStockLocation = await stockLocationDomain.add(stockLocationData)

  const foundStockLocation = await stockLocationDomain.getById(createdStockLocation.id)

  t.is(createdStockLocation.name,  foundStockLocation.name)
  t.is(createdStockLocation.id,  foundStockLocation.id)
})

test('getById should return null if id does not exists ', async t => {
  const randomId = 32323432
  const foundStockLocation = await stockLocationDomain.getById(randomId)

  t.is(foundStockLocation, null)
})
