const customerController = require('../controllers/customer')
const router = require('express').Router()

router.get('/customer/:documentId', customerController.getCustomerByDocumentId)

module.exports = router
