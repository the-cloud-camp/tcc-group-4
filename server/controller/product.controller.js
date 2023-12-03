const {
  createProductService,
  getAllProductsService,
  getProductService,
  updateProductService,
  deleteProductService,
} = require('../service/product.service')
const { standardResponse } = require('../utils')
const { createTxnController } = require('./txn.controller')

const createProductController = async (req, res) => {
  try {
    const data = await createProductService(req.body.product)
    res.json(
      standardResponse({ message: 'Product created successfully', ...data }),
    )
  } catch (err) {
    res.status(400).json(standardResponse({ errorMessage: err.message }, 400))
  }
}

const getAllProductController = async (req, res) => {
  try {
    const data = await getAllProductsService()
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const getProductController = async (req, res) => {
  try {
    const data = await getProductService(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const userCheckoutProductController = async (req, res) => {
  try {
    await createTxnController(req, res)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const updateProductController = async (req, res) => {
  try {
    const data = await updateProductService(req.body.product)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const deleteProductController = async (req, res) => {
  try {
    const data = await deleteProductService(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = {
  createProductController,
  getAllProductController,
  getProductController,
  userCheckoutProductController,
  updateProductController,
  deleteProductController,
}
