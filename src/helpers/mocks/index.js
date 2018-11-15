const generateData = require('../randomDataGenerator')

const dataCreator = mockCreator => custom => ({...mockCreator(), ...custom})

const productMock = () => ({
  name: generateData().toUpperCase(),
  brand: generateData().toUpperCase(),
  sku: generateData(),
  category: 'RELOGIO',
  hasSerialNumber: false,
  priceBuy: 1000,
  priceSell: 1200
})

const orderDataMock = () => ({ 
  description: generateData(),
  reason: generateData(),
  status: 'REGISTERED',
  orderProducts: []
})

const stockLocationMock = () => ({ name: generateData() })

module.exports = {
  product: dataCreator(productMock),
  stockLocation: dataCreator(stockLocationMock),
  orderData: dataCreator(orderDataMock)
}