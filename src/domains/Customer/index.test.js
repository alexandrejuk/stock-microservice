const mockGetCustomerByDocumentId = jest.fn()
jest.mock('../../services/connecta', () => ({
  getCustomerByDocumentId: mockGetCustomerByDocumentId,
}))

const CustomerDomain = require('./')
const mocks = require('../../helpers/mocks')
const randomGenerator = require('../../helpers/randomDataGenerator')

const customerDomain = new CustomerDomain()


test('should create a natural person customer', async () => {
  const customerDataPF = mocks.customerData({
    type: 'natural',
    mainId: mocks.documentData('cpf'),
    naturalPerson: {
    }
  })

  const customer = await customerDomain.create(customerDataPF)

  expect(customer).toBeTruthy()
  expect(customer.name).toBe(customerDataPF.name)
  expect(customer.type).toBe('natural')
  expect(customer.active).toBe(true)
  expect(customer.legalPerson).toBeUndefined()

  expect(customer.naturalPerson).toBeTruthy()
})

test('should create a legal person customer', async () => {
  const customerDataPJ = mocks.customerData({
    mainId: mocks.documentData('cnpj'),
    type: 'legal',
    legalPerson: {
      legalName: randomGenerator(10),
    }
  })

  const customer = await customerDomain.create(customerDataPJ)

  expect(customer).toBeTruthy()
  expect(customer.name).toBe(customerDataPJ.name)
  expect(customer.type).toBe('legal')
  expect(customer.active).toBe(true)

  expect(customer.legalPerson).toBeTruthy()
  expect(customer.naturalPerson).toBeUndefined()
  expect(customer.legalPerson.legalName).toBe(customerDataPJ.legalPerson.legalName.toUpperCase())
})


test('should create a legal person customer', async () => {
  const customerDataPJ = mocks.customerData({
    mainId: mocks.documentData('cnpj'),
    type: 'legal',
    legalPerson: {
      legalName: randomGenerator(10),
    }
  })

  const customer = await customerDomain.create(customerDataPJ)

  expect(customer).toBeTruthy()
  expect(customer.name).toBe(customerDataPJ.name)
  expect(customer.type).toBe('legal')
  expect(customer.active).toBe(true)

  expect(customer.legalPerson).toBeTruthy()
  expect(customer.naturalPerson).toBeUndefined()
  expect(customer.legalPerson.legalName).toBe(customerDataPJ.legalPerson.legalName.toUpperCase())
})

describe('getByDocumentNumber', () => {
  test('should create a new customer if it does not exist in our database', async () => {
    const customer = customerDomain.getByDocumentNumber('423423423')

    expect(mockGetCustomerByDocumentId).toHaveBeenCalled()
  })
})
// test('should get customer by its document number', async () => {
//   const documerNumber = String(customerDataPJ.documents[0].value)
//   const foundCustomer = await customerDomain.getByDocumentNumber(documerNumber)
  
//   expect(foundCustomer).toBeTruthy()
//   expect(foundCustomer.name).toBe(customerDataPJ.name)
//   expect(foundCustomer.type).toBe(customerDataPJ.type)
//   expect(createdCustomerPJ.documents[0].value).toBe(documerNumber)
// })
