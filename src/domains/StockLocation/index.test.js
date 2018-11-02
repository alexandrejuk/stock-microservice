const expect = require('expect');
const StockLocation = require('./')
const databaseHelper = require('../../helpers/database')

const stockLocationDomain = new StockLocation()
const stockLocationMock = { name: 'amazon' }



test('Should be a stockLocation instance', () => {
  const stockLocationDomain = new StockLocation()
  expect(stockLocationDomain instanceof StockLocation).toBe(true)
})

test('Should add a new stockLocaton', async () => {
  const stockLocationData = stockLocationMock
  const createdStockLocation = await stockLocationDomain.add(stockLocationData)
  expect(stockLocationData.name.toUpperCase()).toBe(createdStockLocation.name)
})

test('Should find a stock location by its id', async () => {
  const stockLocationData = stockLocationMock
  const createdStockLocation = await stockLocationDomain.add(stockLocationData)

  const foundStockLocation = await stockLocationDomain.getById(createdStockLocation.id)

  expect(createdStockLocation.name).toBe(foundStockLocation.name)
  expect(createdStockLocation.id).toBe(foundStockLocation.id)
})

test('getById should return null if id does not exists ', async () => {
  const randomId = 32323432
  const foundStockLocation = await stockLocationDomain.getById(randomId)

  expect(foundStockLocation).toBe(null)
})
