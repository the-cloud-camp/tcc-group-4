const { isRabbitMQConnectedFunc } = require('../rabbitmq')
const { sendingEmail, sendEmail } = require('../service/email.service')
const { processPayment } = require('../service/payment.service')
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
    if (!isRabbitMQConnectedFunc())
      return res.status(500).json({ error: 'Queue is not ready' })
    const data = await createTxnService(req.body.txn)

    if (!data.isReserve)
      return res.status(500).json({ error: 'Cannot Reserve product' })

    await processPayment({
      txnId: data.txnId,
      txnAmount: data.txnAmount,
    })

    const emailContext = {
      ...req.body,
      txnId: data.txnId,
    }
    await sendEmail(emailContext)

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateTxnController = async (message) => {
  const { txnStatus, txnId } = message
  try {
    if (txnStatus === 'SUCCESS') {
      await updateTxnSuccessStatusService(txnId)
      console.log(`Transaction ${txnId} status: SUCCESS`)
    } else {
      await rollbackTxnService(txnId)
      console.log(`Transaction ${txnId} status: FAILED`)
    }
  } catch (err) {
    console.log(err)
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
