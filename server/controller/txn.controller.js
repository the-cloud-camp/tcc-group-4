const fs = require('fs')
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
const logfilepath =
  '/Users/supatat/Documents/Training/cloud-camp-project/app/tcc-group-4/server/logs/transaction_logs.txt'
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

    // console.log(data.createdTxn)
    // console.log(data.isReserve)
    if (!data.isReserve) {
      return res
        .status(200)
        .json({ error: 'Insufficient stock', txn: data.createdTxn })
    }

    const { txnId, txnAmount, ...createdTxn } = data.createdTxn

    fs.appendFileSync(
      logfilepath,
      `${txnId} : ${txnAmount} : ${createdTxn.txnStatus}\n`,
    )

    // fs.writeFileSync(
    //   '/Users/supatat/Documents/Training/cloud-camp-project/app/tcc-group-4/server/logs',
    //   `${txnId} : ${txnAmount} : ${createdTxn.txnStatus}`,
    // )

    await processPayment({
      txnId: txnId,
      txnAmount: txnAmount,
    })

    const emailContext = {
      ...req.body,
      txnId: txnId,
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
      // console.log(`Transaction ${txnId} status: SUCCESS`)
    } else {
      await rollbackTxnService(txnId)
      // console.log(`Transaction ${txnId} status: FAILED`)
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
