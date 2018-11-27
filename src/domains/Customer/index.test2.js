const CustomerDomain = require('./')
const mocks = require('../../helpers/mocks')

const customerDomain = new CustomerDomain()

let createdCustomerPF = null
let createdCustomerPJ = null
const customerDataPF = mocks.customerData({
  documents: [mocks.documentData({ type: 'cpf' })],
  type: 'fisica'
})
const customerDataPJ = mocks.customerData({
  documents: [mocks.documentData()],
  type: 'juridica'
})

beforeAll(async () => {
  createdCustomerPF = await customerDomain.create(customerDataPF)
  createdCustomerPJ = await customerDomain.create(customerDataPJ)
})

test('should create a new customer of type fisica', async () => {
  expect(createdCustomerPF).toBeTruthy()
  expect(createdCustomerPF.name).toBe(customerDataPF.name)
  expect(createdCustomerPF.type).toBe('fisica')

  expect(createdCustomerPF.documents).toHaveLength(1)
  expect(createdCustomerPF.documents[0].type).toBe('cpf')
  expect(createdCustomerPF.documents[0].value).toBe(String(customerDataPF.documents[0].value))
})

test('should create a new customer of type jurica', async () => {
  expect(createdCustomerPJ).toBeTruthy()
  expect(createdCustomerPJ.name).toBe(customerDataPJ.name)
  expect(createdCustomerPJ.type).toBe('juridica')

  expect(createdCustomerPJ.documents).toHaveLength(1)
  expect(createdCustomerPJ.documents[0].type).toBe('cnpj')
  expect(createdCustomerPJ.documents[0].value).toBe(String(customerDataPJ.documents[0].value))
})

test('should get customer by its document number', async () => {
  const documerNumber = String(customerDataPJ.documents[0].value)
  const foundCustomer = await customerDomain.getByDocumentNumber(documerNumber)
  
  expect(foundCustomer).toBeTruthy()
  expect(foundCustomer.name).toBe(customerDataPJ.name)
  expect(foundCustomer.type).toBe(customerDataPJ.type)
  expect(createdCustomerPJ.documents[0].value).toBe(documerNumber)
})
