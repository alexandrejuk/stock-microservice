const orderController = require('../controllers/order')
const router = require('express').Router()

router.post('/orders', orderController.add)
router.get('/orders', orderController.get)
router.get('/orders/:id', orderController.getById)



module.exports = router
