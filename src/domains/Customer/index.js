const database = require('../../db')

const Customer = database.model('customer')
const Document = database.model('document')

class CustomerDomain {
  async create (customerData) {
    const customer = await Customer.create(
      customerData,
      {
        include: [Document]
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