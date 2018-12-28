const callController = require('../controllers/call')
const router = require('express').Router()

router.get('/calls/:documentId', callController.get)

module.exports = router
