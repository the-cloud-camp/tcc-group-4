const express = require('express')
const {
  createProductController,
  getAllProductController,
  getProductController,
  updateProductController,
  deleteProductController,
  userCheckoutProductController,
} = require('../controller/product.controller')
const router = express.Router()

router.get('/all', getAllProductController)
router.get('/:id', getProductController)
router.post('/create', createProductController)
router.post('/checkout', userCheckoutProductController)
router.post('/update', updateProductController)
router.post('/delete/:id', deleteProductController)

module.exports = router
