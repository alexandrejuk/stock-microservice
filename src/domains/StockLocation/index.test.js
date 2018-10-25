const test = require('ava')
const StockLocation = require('./')
const databaseHelper = require('../../helpers/database')

test.before(databaseHelper.isDatabaseConnected)

test('Should be a stockLocation instance', t => {
  const stockLocationDomain = new StockLocation()
  t.true(stockLocationDomain instanceof StockLocation)
})

test('Should add a new stockLocaton', async t => {
  const stockLocationDomain = new StockLocation()
  const stockLocationData = { name: 'amazon' }
  const createdStockLocation = await stockLocationDomain.add(stockLocationData)
  t.is(stockLocationData.name.toUpperCase(),  createdStockLocation.name)
})
