const database = require('../../db')
const Sequelize = require('sequelize')
const connectaService = require('../../services/connecta')
const customerFormatter = require('./formatter')

const Customer = database.model('customer')
const NaturalPerson = database.model('naturalPerson')
const LegalPerson = database.model('legalPerson')

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

    return customer
  }

  async getById(id) {
    const customer = await Customer.findByPk(id)

    return customer
  }

  async getByDocumentNumber(documentNumber) {
    const customer = await Customer.findOne({
      where: {
        mainId: documentNumber,
      },
      include: [NaturalPerson, LegalPerson]
    })

    if (customer) {
      return customer
    }
  
    /**
     * if customer is not found in database, try connecta instead,
     * then, convert it and save in the database
     */
    const foundCustomerInConnecta = await connectaService.getCustomerByDocumentId(documentNumber)
    const formattedCustomer = customerFormatter(foundCustomerInConnecta)

    const createdCustomer = await this.create(formattedCustomer)

    return createdCustomer
  }
}

module.exports = CustomerDomain