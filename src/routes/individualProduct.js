const individualProductController = require('../controllers/individualProduct')
const router = require('express').Router()

router.get('/individual-products', individualProductController.get)
router.get('/individual-products/:id', individualProductController.getById)
router.put('/individual-products/:id', individualProductController.update)

module.exports = router
