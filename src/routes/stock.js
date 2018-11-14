const stockController = require('../controllers/stock')
const router = require('express').Router()

router.get('/stocks', stockController.get)

module.exports = router
