const database = require('../../db')
const Sequelize = require('sequelize')
const connectaService = require('../../services/connecta')
const R = require('ramda')

const Customer = database.model('customer')
const NaturalPerson = database.model('naturalPerson')
const LegalPerson = database.model('legalPerson')

const formatConnectaCustomer = R.applySpec({
  
})

class CustomerDomain {
  async create (customerData, options = {}) {
    const { transaction } = options
    const { type } = customerData
    
    const include = (type === 'natural') ?
      [NaturalPerson] : [LegalPerson]
      
    const customer = await Customer.create(
      customerData,
      {
        include,
        transaction,
      }
    )

    console.log('oi', JSON.stringify(customer))

    return customer
  }

  async getByDocumentNumber(documentNumber) {
    // const customer = await Customer.findOne({
    //   include: [{ 
    //     model: Document,
    //     where: {
    //       value: documentNumber,
    //     }
    //   }]
    // })

    // if (customer) {
    //   return customer
    // }
  
    /**
     * if customer is not found in database, try connecta instead,
     * then, convert it and save in the database
     */
    const foundCustomerInConnecta = await connectaService.getCustomerByDocumentId(documentNumber)
  
    

    /**
     * 
    { 
      _id: '59e4d65376f5cb0001f68a18',
      createdAt: '2017-10-16T15:54:59.140Z',
      updatedAt: '2017-10-16T15:54:59.140Z',
      cnpj_cpf: '49464555000183',
      nome_razao_social: 'COMERCIAL PET SHOP JORGE FERREIRA LTDA - ME',
      createdBy: 'patricio',
      updatedBy: 'patricio',
      contatos:
      [ { nome: 'CINTIA / SAMIR',
          telefone: '1138329406',
          _id: '59e4d65376f5cb0001f68a1a',
          observacao: '01 PRISMA SF BIO + PROX 01 SOFTWARE SECULLUM 4',
          celular: '',
          email: 'samirconrado@hotmail.com' } ],
      enderecos:
      [ { cep: '05072030',
          rua: 'Rua Herbart',
          bairro: 'Lapa',
          numero: '47',
          cidade: 'São Paulo',
          uf: 'SP',
          _id: '59e4d65376f5cb0001f68a19',
          ponto_referencia: 'DENTRO MERCADO MUNICIPAL DA LAPA',
          complemento: '' } ],
      inscricao_estadual: '110044702110',
      nome_fantasia: 'COMERCIAL CONRADO'
      }
    */

    return foundCustomerInConnecta
  }
}

module.exports = CustomerDomain