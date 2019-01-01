const mocks = require('../../helpers/mocks')
const request = require('../../helpers/request')
const Ramda = require('ramda')
const omitDBProperties = Ramda.omit([
  'id',
  'updatedAt',
  'createdAt',
  'deletedAt'
])

describe('post /products', () => {
  test('should add a new product', async () => {
    const product = mocks.product()
    const response = await request().post('/api/products', product)

    expect(response.statusCode).toBe(200)
    expect(omitDBProperties(response.body)).toEqual(product)
  })
})

