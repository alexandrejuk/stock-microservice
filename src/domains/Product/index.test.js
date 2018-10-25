const test = require('ava')
const Product = require('./')
const databaseHelper = require('../../helpers/database')

test.before(databaseHelper.isDatabaseConnected)

test('Should be a class', t => {
  const productDomain = new Product()
  t.true(productDomain instanceof Product)
})


test('Should add a product', async t => {
  const productDomain = new Product()
  const product = { name: 'iphone 7s' }
  const createdProduct = await productDomain.add(product)
  t.is(product.name, createdProduct.name)
})
