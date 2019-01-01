const productController = require('../controllers/product')
const router = require('express').Router()

router.post('/products', productController.add)
router.get('/products', productController.get)
router.get('/products/:id', productController.getById)
router.put('/products/:id', productController.update)
router.get('/stock-products', productController.getStockProducts)
router.get('/stock-products/:stockLocationId', productController.getStockProductsStockLocationId)

module.exports = router
