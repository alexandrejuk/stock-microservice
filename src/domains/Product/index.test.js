const test = require('ava')
const Product = require('./')
const databaseHelper = require('../../helpers/database')

test.before(databaseHelper.isDatabaseConnected)

test('Should be a product instance', t => {
  const productDomain = new Product()
  t.true(productDomain instanceof Product)
})

test('Should add a product', async t => {
  const productDomain = new Product()
  const product = { name: 'iphone 7s' }
  const createdProduct = await productDomain.add(product)
  t.is(product.name.toUpperCase(), createdProduct.name)
})

test('Should get a product by id', async t => {
  const productDomain = new Product()
  const product = { name: 'iphone 7s' }
  const createdProduct = await productDomain.add(product)
  const result = await productDomain.getById(createdProduct.id)

  t.is(createdProduct.id, result.id)
  t.is(createdProduct.name, result.name)
})
