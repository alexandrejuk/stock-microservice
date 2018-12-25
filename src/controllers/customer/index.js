const CustomerDomain = require('../../domains/Customer')

const customerDomain = new CustomerDomain()


const getCustomerByDocumentId = async (req, res, next) => {
  const documentId = req.params.documentId

  try{
    const customer = await customerDomain.getByDocumentNumber(documentId)

    res.status(200).send(customer)
  } catch(error) {
    next(error)
  }
}

module.exports = {
  getCustomerByDocumentId,
}