const reservationController = require('../controllers/reserve')
const router = require('express').Router()

router.post('/reservation', reservationController.add)
router.get('/reservation', reservationController.getAll)
router.get('/reservation/:id', reservationController.get)
router.get('/reservation-products/:employeeId', reservationController.getAllProducts)


module.exports = router
