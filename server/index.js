const express = require('express')
const amqp = require('amqplib')
const cors = require('cors')
require('dotenv').config()
const productRoute = require('./route/product.route')
const txnRoute = require('./route/txn.route')
const { createChannel, updateRabbitMQConnection } = require('./rabbitmq')
const { updateTxnController } = require('./controller/txn.controller')
const app = express()

let connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5672'
let paymentChannel, emailChannel, updateChannel
const updateQueue = 'tcc-group-4-update-transaction1'
let isConnected = false

connectQueue()
async function connectQueue() {
  try {
    const connection = await amqp.connect(`amqp://${connectionSvc}`)
    isConnected = true
    updateRabbitMQConnection(connection, isConnected)

    connection.on('close', () => {
      console.log('connection closed')
      isConnected = false
      updateRabbitMQConnection(connection, isConnected)
      startInterval()
    })

    connection.on('error', () => {
      console.log('connection error')
      isConnected = false
      updateRabbitMQConnection(connection, isConnected)
      startInterval()
    })

    const channel = await createChannel(connection, isConnected)
    paymentChannel = channel.paymentChannel
    emailChannel = channel.emailChannel
    updateChannel = channel.updateChannel

    updateChannel.consume(updateQueue, async (message) => {
      if (message) {
        const messageBody = JSON.parse(message.content.toString())
        console.log(`Message received from RabbitMQ: ${messageBody}`)
        await updateTxnController(messageBody)
        updateChannel.ack(message)
      }
    })
  } catch (err) {
    console.log(err)
  }
}

const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())
app.use('/product', productRoute)
app.use('/txn', txnRoute)

app.listen(port, () => {
  console.log(`Server is start at http://localhost:${port}`)
})

const startInterval = () => {
  const intervalId = setInterval(() => {
    if (isConnected) {
      console.log('RabbitMQ is connected. Stop checking.')
      clearInterval(intervalId)
    } else {
      console.log('RabbitMQ is not connected. Attempting to reconnect...')
      connectQueue()
    }
  }, 1000)
}

startInterval()
