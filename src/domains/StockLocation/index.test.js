const expect = require('expect');
const StockLocation = require('./')
const mock = require('../../helpers/mocks')

const stockLocationDomain = new StockLocation()

let stockLocationMock = null
beforeEach(() => {
  stockLocationMock = mock.stockLocation()
})

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
  const randomId = 'c2a93508-8fba-4ebe-b24d-d9a896d4c7b8'
  const foundStockLocation = await stockLocationDomain.getById(randomId)

  expect(foundStockLocation).toBe(null)
})
