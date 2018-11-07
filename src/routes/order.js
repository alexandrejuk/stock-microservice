const orderController = require('../controllers/order')
const router = require('express').Router()

router.post('/orders', orderController.add)

module.exports = router
