const R = require('ramda')
const getCustomerType = document => document.length > 11 ? 'legal' : 'natural'

const formatConnectaCustomer = R.applySpec({
  mainId: R.prop('cnpj_cpf'),
  name: R.prop('nome_razao_social'),
  naturalPerson: R.applySpec({
    nickName: R.prop('nome_razao_social'),
  }),
  type: R.pipe(
    R.prop('cnpj_cpf'),
    getCustomerType,
  ),
  legalPerson: R.applySpec({
    legalName: R.prop('nome_fantasia'),
    inscricaoEstadual: R.prop('inscricao_estadual'),
  }),
})

module.exports = formatConnectaCustomer