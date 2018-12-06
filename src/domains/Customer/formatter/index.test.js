const customerFormatter = require('.')

const naturalConnectaCustomer = {
  _id: '59e4d65376f5cb0001f68a18',
  createdAt: '2017-10-16T15:54:59.140Z',
  updatedAt: '2017-10-16T15:54:59.140Z',
  cnpj_cpf: '42892311450',
  nome_razao_social: 'Vitor Lima',
  createdBy: 'patricio',
  updatedBy: 'patricio',
  contatos: [],
  enderecos: [],
  inscricao_estadual: null,
  nome_fantasia: null,
}

const legalConnectaCustomer = {
  _id: '59e4d65376f5cb0001f68a18',
  createdAt: '2017-10-16T15:54:59.140Z',
  updatedAt: '2017-10-16T15:54:59.140Z',
  cnpj_cpf: '44834242000156',
  nome_razao_social: 'Empresa X',
  createdBy: 'patricio',
  updatedBy: 'patricio',
  contatos: [],
  enderecos: [],
  inscricao_estadual: '312312312312',
  nome_fantasia: 'Nome X',
}

test('should format a natural connecta customer to a customer', () => {
  const formattedCustomer =  customerFormatter(naturalConnectaCustomer)

  expect(formattedCustomer).toBeTruthy()
  expect(formattedCustomer.mainId).toBe(naturalConnectaCustomer.cnpj_cpf)
  expect(formattedCustomer.name).toBe(naturalConnectaCustomer.nome_razao_social)
  expect(formattedCustomer.type).toBe('natural')
})

test('should format a legal connecta customer to a customer', () => {
  const formattedCustomer =  customerFormatter(legalConnectaCustomer)

  expect(formattedCustomer).toBeTruthy()
  expect(formattedCustomer.mainId).toBe(legalConnectaCustomer.cnpj_cpf)
  expect(formattedCustomer.name).toBe(legalConnectaCustomer.nome_razao_social)
  expect(formattedCustomer.type).toBe('legal')

  expect(formattedCustomer.legalPerson.inscricaoEstadual).toBe(legalConnectaCustomer.inscricao_estadual)
  expect(formattedCustomer.legalPerson.legalName).toBe(legalConnectaCustomer.nome_fantasia)
})