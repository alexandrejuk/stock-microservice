const generateData = require('../randomDataGenerator')

const dataCreator = mock => custom => ({...mock, ...custom})

const productMock = {
  name: generateData(),
  brand: generateData(),
  sku: generateData(),
  category: 'relogio',
  hasSerialNumber: false,
  priceBuy: 1000,
  priceSell: 1200
}

const orderDataMock = { 
  description: generateData(),
  reason: generateData(),
  status: 'registered',
  orderProducts: []
}

const stockLocationMock = { name: generateData() }

module.exports = {
  product: dataCreator(productMock),
  stockLocation: dataCreator(stockLocationMock),
  orderData: dataCreator(orderDataMock)
}