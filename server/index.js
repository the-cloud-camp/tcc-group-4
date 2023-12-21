const express = require('express')
const amqp = require('amqplib')
const cors = require('cors')
require('dotenv').config()
const productRoute = require('./route/product.route')
const txnRoute = require('./route/txn.route')
const ticketRoute = require('./route/ticket.route')
const { createChannel, updateRabbitMQConnection } = require('./rabbitmq')
const {
  updateTxnController,
  createTxnControllerConsumerAction,
} = require('./controller/txn.controller')
const app = express()

let connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5672'
let checkoutConnectionSVC = process.env.CONSUME_CHECKOUT_SVC || 'localhost:5673'
let connection, checkoutConnection
let paymentChannel, emailChannel, updateChannel, checkoutChannel
const checkoutQueue = 'tcc-group-4-checkout1'
const updateQueue = 'tcc-group-4-update-transaction1'
let isConnected = false
// const fs = require('fs')
// const logfilepath = '../logs/transaction_logs.txt'

connectQueue()
connectCheckoutQueue()

async function connectCheckoutQueue() {
  try {
    checkoutConnection = await amqp.connect(`amqp://${checkoutConnectionSVC}`)
    checkoutConnection.on('error', (err) => {
      if (err.message.includes('Connection closed')) {
        console.error('Checkout Connection closed, reconnecting...')
        setTimeout(connectCheckoutQueue, 5000)
      } else {
        console.error('Connection error:', err.message)
      }
    })

    checkoutChannel = await checkoutConnection.createChannel()

    checkoutChannel.assertQueue(checkoutQueue, {
      durable: true,
    })

    checkoutChannel.prefetch(1)

    startRecieveCheckoutConsumer()
  } catch (err) {
    console.log(err)
    setTimeout(connectCheckoutQueue, 5000)
  }
}
async function connectQueue() {
  try {
    connection = await amqp.connect(`amqp://${connectionSvc}`)
    isConnected = true
    updateRabbitMQConnection(connection, isConnected)

    connection.on('error', (err) => {
      isConnected = false
      if (err.message.includes('Connection closed')) {
        console.error('Connection closed, reconnecting...')
        updateRabbitMQConnection(connection, isConnected)
        setTimeout(connectQueue, 5000) // Retry connection
      } else {
        console.error('Connection error:', err.message)
      }
    })

    const channel = await createChannel(connection, isConnected)

    paymentChannel = channel.paymentChannel
    emailChannel = channel.emailChannel
    updateChannel = channel.updateChannel
    updateChannel.prefetch(1)

    startUpdateConsumer()
  } catch (err) {
    console.log(err)
    setTimeout(connectQueue, 5000)
  }
}

function startUpdateConsumer() {
  if (!connection) {
    console.log('not connected')
    return
  }

  updateChannel.consume(
    updateQueue,
    async (message) => {
      try {
        if (message) {
          // fs.appendFileSync(
          //   logfilepath,
          //   'update status : ' + message.content.toString(),
          // )
          const messageBody = JSON.parse(message.content.toString())
          // console.log({ consumeMessage: messageBody })

          // console.log(`Message received from RabbitMQ: ${messageBody}`)
          await updateTxnController(messageBody)
          updateChannel.ack(message)
        }
      } catch (err) {
        console.log(err)
      }
    },
    { noAck: false },
  )

  updateChannel.on('close', () => {
    console.error('Channel closed, reconnecting...')
    setTimeout(connectQueue, 5000)
  })

  updateChannel.on('error', (error) => {
    console.error('Channel error:', error.message)
  })

  console.log('Consumer started')
}

function startRecieveCheckoutConsumer() {
  if (!checkoutConnection) {
    console.log('not connected')
    return
  }

  checkoutChannel.consume(
    checkoutQueue,
    async (message) => {
      try {
        if (message) {
          console.log('receive checkout : ' + message.content.toString())
          // fs.appendFileSync(
          //   logfilepath,
          //   'receive checkout : ' + message.content.toString(),
          // )
          const messageBody = JSON.parse(message.content.toString())

          await createTxnControllerConsumerAction(messageBody)
          checkoutChannel.ack(message)
        }
      } catch (err) {
        console.log(err)
      }
    },
    { noAck: false },
  )

  checkoutChannel.on('close', () => {
    console.error('Checkout Channel closed, reconnecting...')
    setTimeout(connectQueue, 5000)
  })

  checkoutChannel.on('error', (error) => {
    console.error('Checkout Channel error:', error.message)
  })

  console.log('Checkout Consumer started')
}

const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())
app.use('/product', productRoute)
app.use('/txn', txnRoute)
app.use('/ticket', ticketRoute)

app.listen(port, () => {
  // fs.writeFileSync(logfilepath, '')
  console.log(`Server is start at http://localhost:${port}`)
})
