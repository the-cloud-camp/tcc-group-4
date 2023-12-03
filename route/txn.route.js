const express = require('express')
const {
  createTxnController,
  getTxnsByPhoneNumberController,
  updateTxnController,
  getAllTxnsController,
  getTxnByTxnIdController,
} = require('../controller/txn.controller')
const router = express.Router()

router.get('/all', getAllTxnsController)
router.post('/create', createTxnController)
router.post('/update', updateTxnController)
router.get('/:txnId', getTxnByTxnIdController)

module.exports = router
