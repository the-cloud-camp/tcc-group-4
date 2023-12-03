const {
  createTxnService,
  updateTxnSuccessStatusService,
  getAllTxnsService,
  rollbackTxnService,
  getTxnByTxnIdService,
} = require('../service/txn.service')

const getAllTxnsController = async (req, res) => {
  try {
    const data = await getAllTxnsService()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createTxnController = async (req, res) => {
  try {
    const data = await createTxnService(req.body.txn)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateTxnController = async (req, res) => {
  const { txnStatus, txnId } = req.body.txn
  try {
    if (txnStatus === 'SUCCESS') {
      await updateTxnSuccessStatusService(txnId)
    } else {
      await rollbackTxnService(txnId)
    }
    res.json({ message: 'Transaction updated successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getTxnByTxnIdController = async (req, res) => {
  try {
    const data = await getTxnByTxnIdService(req.params.txnId)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getAllTxnsController,
  createTxnController,
  updateTxnController,
  getTxnByTxnIdController,
}
