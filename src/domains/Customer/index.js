const database = require('../../db')
const Sequelize = require('sequelize')

const Customer = database.model('customer')
const Document = database.model('document')

class CustomerDomain {
  async create (customerData, options = {}) {
    const { transaction } = options
    const { documents } = customerData
    let foundCustomer = null
  
    for (let i = 0; i < documents.length && !foundCustomer; i++) {
      const document = documents[i]
      const foundCustomer = this.getByDocumentNumber(document.value)
      if (foundCustomer) {
        break
      }
    }

    if(foundCustomer){
      return foundCustomer
    }
      
    const customer = await Customer.create(
      customerData,
      {
        include: [Document],
        transaction,
      }
    )

    return customer
  }

  async getByDocumentNumber(documentNumber) {
    const customer = await Customer.findOne({
      include: [{
        model: Document,
        where: {
          value: documentNumber,
        }
      }]
    })

    return customer
  }
}

module.exports = CustomerDomain