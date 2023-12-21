const express = require('express')
const amqp = require('amqplib')
const cors = require('cors')
require('dotenv').config()
const productRoute = require('./route/product.route')
const txnRoute = require('./route/txn.route')
const ticketRoute = require('./route/ticket.route')
const { createChannel, updateRabbitMQConnection } = require('./rabbitmq')
const { updateTxnController } = require('./controller/txn.controller')
const app = express()

let connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5672'
let paymentChannel, emailChannel, updateChannel, connection
const updateQueue = 'tcc-group-4-update-transaction1'
let isConnected = false
const fs = require('fs')
const logFilePath =
  '/Users/supatat/Documents/Training/cloud-camp-project/app/tcc-group-4/server/logs/transaction_logs.txt'

connectQueue()
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

    startConsumer()
  } catch (err) {
    console.log(err)
    setTimeout(connectQueue, 5000)
  }
}

function startConsumer() {
  if (!connection) {
    console.log('not connected')
    return
  }

  updateChannel.consume(
    updateQueue,
    async (message) => {
      try {
        if (message) {
          fs.appendFileSync(
            logFilePath,
            'update status : ' + message.content.toString(),
          )
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

const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())
app.use('/product', productRoute)
app.use('/txn', txnRoute)
app.use('/ticket', ticketRoute)

app.listen(port, () => {
  fs.writeFileSync(logFilePath, '')
  console.log(`Server is start at http://localhost:${port}`)
})
