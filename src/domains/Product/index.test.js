const expect = require('expect');
const Product = require('./')
const mocks = require('../../helpers/mocks')

test('Should be a product instance', () => {
  const productDomain = new Product()
  expect(productDomain instanceof Product).toBe(true)
})

test('Should add a product', async () => {
  const productDomain = new Product()
  const product = mocks.product()
  const createdProduct = await productDomain.add(product)
  
  expect(product.name.toUpperCase()).toBe(createdProduct.name)
  expect(product.brand.toUpperCase()).toBe(createdProduct.brand)
  expect(product.sku).toBe(createdProduct.sku)
  expect(product.category.toUpperCase()).toBe(createdProduct.category)
  expect(product.hasSerialNumber).toBe(createdProduct.hasSerialNumber)
  expect(product.priceBuy).toBe(createdProduct.priceBuy)
  expect(product.priceSell).toBe(createdProduct.priceSell)
})

test('Should get a product by id', async () => {
  const productDomain = new Product()
  const productMock = mocks.product()
  const createdProduct = await productDomain.add(productMock)
  const result = await productDomain.getById(createdProduct.id)

  expect(createdProduct.id).toBe(result.id)
  expect(createdProduct.name).toBe(result.name)
  expect(createdProduct.brand).toBe(result.brand)
  expect(createdProduct.sku).toBe(result.sku)
  expect(createdProduct.category).toBe(result.category)
  expect(productMock.hasSerialNumber).toBe(result.hasSerialNumber)
  expect(createdProduct.priceBuy).toBe(result.priceBuy)
  expect(createdProduct.priceSell).toBe(result.priceSell)
})
