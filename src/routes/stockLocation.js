const stockLocationController = require('../controllers/stockLocation')
const router = require('express').Router()

router.get('/stockLocations', stockLocationController.get)

module.exports = router
