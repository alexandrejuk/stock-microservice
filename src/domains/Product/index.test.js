const test = require('ava')
const Product = require('./')
const databaseHelper = require('../../helpers/database')

const productMock = {
  name: 'iphone 7s',
  brand: 'apple',
  sku: 'a1v456578',
  category: 'cell phone',
  serialControl: true,
  priceBuy: 89000,
  priceSell: 123000
}

test.before(databaseHelper.isDatabaseConnected)

test('Should be a product instance', t => {
  const productDomain = new Product()
  t.true(productDomain instanceof Product)
})

test('Should add a product', async t => {
  const productDomain = new Product()
  const product = productMock
  const createdProduct = await productDomain.add(product)
  
  t.is(product.name.toUpperCase(), createdProduct.name)
  t.is(product.brand.toUpperCase(), createdProduct.brand)
  t.is(product.sku, createdProduct.sku)
  t.is(product.category.toUpperCase(), createdProduct.category)
  t.is(product.serialControl, createdProduct.serialControl)
  t.is(product.priceBuy, createdProduct.priceBuy)
  t.is(product.priceSell, createdProduct.priceSell)
})

test('Should get a product by id', async t => {
  const productDomain = new Product()
  const product = productMock
  const createdProduct = await productDomain.add(product)
  const result = await productDomain.getById(createdProduct.id)

  t.is(createdProduct.id, result.id)
  t.is(createdProduct.name, result.name)
  t.is(createdProduct.brand, result.brand)
  t.is(createdProduct.sku, result.sku)
  t.is(createdProduct.category, result.category)
  t.is(product.serialControl, result.serialControl)
  t.is(createdProduct.priceBuy, result.priceBuy)
  t.is(createdProduct.priceSell, result.priceSell)
})
