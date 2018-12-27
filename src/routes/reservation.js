const reservationController = require('../controllers/reserve')
const router = require('express').Router()

router.post('/reservation', reservationController.add)
router.get('/reservation', reservationController.getAll)
router.get('/reservation/:id', reservationController.get)
router.get('/reservation-products/:employeeId', reservationController.getAllProducts)
router.put('/reservation-products', reservationController.updateProductResevation)
router.delete('/reservation-history/:id', reservationController.deleteHistory)


module.exports = router
