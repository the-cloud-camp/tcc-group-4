const express = require('express')
const amqp = require('amqplib')
const cors = require('cors')
require('dotenv').config()
const app = express()

const sendQueue = 'tcc-group-4-update-transaction1'
const receiveQueue = 'tcc-group-4-payment1'
const connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5672'
let receiveChannel, sendChannel, connection, sendConnection
let isConnected = false
const fs = require('fs')
const { send } = require('process')
const logfilepath =
  '/Users/supatat/Documents/Training/cloud-camp-project/app/tcc-group-4/server/logs/transaction_logs.txt'
connectQueue()
async function connectQueue() {
  try {
    connection = await amqp.connect(`amqp://${connectionSvc}`)
    sendConnection = await amqp.connect(`amqp://${connectionSvc}`)

    sendConnection.on('error', (err) => {
      isConnected = false
      if (err.message.includes('Connection closed')) {
        console.error('Connection closed, reconnecting...')
        setTimeout(connectQueue, 5000) // Retry connection
      } else {
        console.error('Connection error:', err.message)
      }
    })

    connection.on('error', (err) => {
      isConnected = false
      if (err.message.includes('Connection closed')) {
        console.error('Connection closed, reconnecting...')
        setTimeout(connectQueue, 5000) // Retry connection
      } else {
        console.error('Connection error:', err.message)
      }
    })

    sendChannel = await sendConnection.createChannel()
    receiveChannel = await connection.createChannel()
    console.log('connected to rabbitmq')

    sendChannel.assertQueue(sendQueue, {
      durable: true,
    })

    receiveChannel.assertQueue(receiveQueue, {
      durable: true,
    })
    receiveChannel.prefetch(1)

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

  receiveChannel.consume(
    receiveQueue,
    async (message) => {
      try {
        if (message) {
          fs.appendFileSync(logfilepath, `${message.content.toString()}\n`)
          console.log(` ${message.content.toString()}`)
          const messageBody = JSON.parse(message.content.toString())
          console.log({ messageBody })
          const txn = {
            txnStatus: 'SUCCESS',
            ...messageBody,
          }
          console.log(`Message received from RabbitMQ: ${JSON.stringify(txn)}`)
          await sendMessage(txn)
          receiveChannel.ack(message)
        }
      } catch (err) {
        console.log(err)
      }
    },
    { noAck: false },
  )

  sendChannel.on('close', () => {
    console.error('Channel closed, reconnecting...')
    setTimeout(connectQueue, 5000)
  })

  sendChannel.on('error', (error) => {
    console.error('Channel error:', error.message)
  })

  receiveChannel.on('close', () => {
    console.error('Channel closed, reconnecting...')
    setTimeout(connectQueue, 5000)
  })

  receiveChannel.on('error', (error) => {
    console.error('Channel error:', error.message)
  })
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
  fs.writeFileSync(logfilepath, '')
  console.log(`Server is start at http://localhost:${port}`)
})
