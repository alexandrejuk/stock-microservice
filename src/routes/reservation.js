const reservationController = require('../controllers/reserve')
const router = require('express').Router()

router.post('/reservation', reservationController.add)

module.exports = router
