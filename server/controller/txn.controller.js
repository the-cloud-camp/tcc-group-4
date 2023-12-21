// const fs = require('fs')
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
// const logfilepath = '../logs/transaction_logs.txt'
const getAllTxnsController = async (req, res) => {
  try {
    const data = await getAllTxnsService()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createTxnControllerConsumerAction = async (message) => {
  try {
    console.log('message you got from checkout queue')
    console.log(message)
    if (!isRabbitMQConnectedFunc()) return
    const data = await createTxnService(message.txn)

    // console.log(data.createdTxn)
    // console.log(data.isReserve)
    if (!data.isReserve) return

    const { txnId, txnAmount, ...createdTxn } = data.createdTxn

    // fs.appendFileSync(
    //   logfilepath,
    //   `${txnId} : ${txnAmount} : ${createdTxn.txnStatus}\n`,
    // )

    await processPayment({
      txnId: txnId,
      txnAmount: txnAmount,
    })

    const emailContext = {
      ...message,
      txnId: txnId,
    }
    await sendEmail(emailContext)
  } catch (err) {
    console.log(err)
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

    // fs.appendFileSync(
    //   logfilepath,
    //   `${txnId} : ${txnAmount} : ${createdTxn.txnStatus}\n`,
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
  createTxnControllerConsumerAction,
}
