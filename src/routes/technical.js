const technicalController = require('../controllers/technical')
const router = require('express').Router()

router.get('/technical', technicalController.get)

module.exports = router
