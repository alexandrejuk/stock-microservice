const test = require('ava')
const Stock = require('./')
const { StockLocationDomain, ProductDomain } = require('../')
const { ValidationError } = require('../../errors')
const databaseHelper = require('../../helpers/database')

const stockDomain = new Stock()

test.before(databaseHelper.isDatabaseConnected)

test.beforeEach(async t => {
  const stockLocationDomain = new StockLocationDomain()
  const productDomain = new ProductDomain()

  const stockLocationData = { name: 'amazon' }
  const stockLocation = await stockLocationDomain.add(stockLocationData)

  const productData = { name: 'amazon' }
  const product = await productDomain.add(productData)

  t.context = {}
  t.context.stockLocationId = stockLocation.id 
  t.context.productId = product.id
})

test('Should be a stock instance', t => {
  t.true(stockDomain instanceof Stock)
})

test('should be add a new event on stock', async t => {
  const { stockLocationId, productId } = t.context
  const stockData = { stockLocationId, productId, quantity: 10 }
  const createdStock = await stockDomain.add(stockData)

  t.is(stockData.productId, createdStock.productId)
  t.is(stockData.stockLocationId, createdStock.stockLocationId)
  t.is(stockData.quantity, createdStock.quantity)
})

// test('add should return a validation error if product or stock does not exists', async t => {
//   const stockData = { stockLocationId: null, productId: null, quantity: 10 }

//   await t.throws(async () => {
// 		await stockDomain.add(stockData)
// 	}, {instanceOf: ValidationError, message: null})
// }) 

const fn = () => {
	throw new TypeError('🦄');
};

test('throws', t => {
	const error = t.throws(() => {
		fn();
	}, TypeError);

	t.is(error.message, '🦄');
});


test('rejects', async t => {
  const stockData = { stockLocationId: null, productId: null, quantity: 10 }

  const error = await t.throws(stockDomain.add(stockData))

	t.true(error instanceof ValidationError)
});

