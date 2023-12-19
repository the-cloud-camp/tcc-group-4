const express = require('express')
const amqp = require('amqplib')
const cors = require('cors')
require('dotenv').config()
const app = express()

const sendQueue = 'tcc-group-4-update-transaction1'
const receiveQueue = 'tcc-group-4-payment1'
const connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5672'
let receiveChannel, sendChannel, connection
let isConnected = false

connectQueue()
async function connectQueue() {
  try {
    connection = await amqp.connect(`amqp://${connectionSvc}`)
    isConnected = true
    connection.on('close', () => {
      console.log('connection closed')
      isConnected = false
      startInterval()
    })

    connection.on('error', () => {
      console.log('connection error')
      isConnected = false
      startInterval()
    })

    sendChannel = await connection.createChannel()
    receiveChannel = await connection.createChannel()
    console.log('connected to rabbitmq')

    sendChannel.assertQueue(sendQueue, {
      durable: true,
    })

    receiveChannel.assertQueue(receiveQueue, {
      durable: true,
    })
    receiveChannel.prefetch(1)

    receiveChannel.consume(
      receiveQueue,
      async (message) => {
        try {
          if (message && receiveChannel) {
            console.log(` ${message.content.toString()}`)
            const messageBody = JSON.parse(message.content.toString())
            const txn = {
              txnStatus: 'SUCCESS',
              ...messageBody,
            }
            console.log(
              `Message received from RabbitMQ: ${JSON.stringify(txn)}`,
            )
            await sendMessage(txn)
            receiveChannel.ack(message)
          }
        } catch (err) {
          console.log(err)
        }
      },
      {
        noAck: false,
      },
    )
  } catch (err) {
    console.log(err)
    startInterval()
  }
}

async function sendMessage(message) {
  try {
    const jsonMessage = JSON.stringify(message)
    await sendChannel.sendToQueue(sendQueue, Buffer.from(jsonMessage), {
      persistent: true,
    })
    console.log(`Message sent to RabbitMQ: ${message}`)
  } catch (err) {
    console.error(`Error sending message to RabbitMQ: ${err}`)
  }
}

const port = process.env.PORT || 8001

app.use(cors())
app.use(express.json())

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
