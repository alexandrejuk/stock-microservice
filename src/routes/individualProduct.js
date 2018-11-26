const individualProductController = require('../controllers/individualProduct')
const router = require('express').Router()

router.post('/individual-products', individualProductController.add)
router.get('/individual-products', individualProductController.get)

module.exports = router
