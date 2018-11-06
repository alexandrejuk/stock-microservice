const productController = require('../controllers/product')
const router = require('express').Router()

router.post('/products', productController.add)

module.exports = router
