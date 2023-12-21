const express = require('express')
const amqp = require('amqplib')
const cors = require('cors')
require('dotenv').config()
const app = express()

const checkoutQueue = 'tcc-group-4-checkout1'
const connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5673'
let sendChannel, sendConnection

connectQueue()
async function connectQueue() {
  try {
    sendConnection = await amqp.connect(`amqp://${connectionSvc}`)

    sendConnection.on('error', (err) => {
      if (err.message.includes('Connection closed')) {
        console.error('Connection closed, reconnecting...')
        setTimeout(connectQueue, 5000) // Retry connection
      } else {
        console.error('Connection error:', err.message)
      }
    })

    sendChannel = await sendConnection.createChannel()
    console.log('connected to rabbitmq')

    sendChannel.assertQueue(checkoutQueue, {
      durable: true,
    })

    sendChannel.on('close', () => {
      console.error('Channel closed, reconnecting...')
      setTimeout(connectQueue, 5000)
    })

    sendChannel.on('error', (error) => {
      console.error('Channel error:', error.message)
    })
  } catch (err) {
    console.log(err)
    setTimeout(connectQueue, 5000)
  }
}

async function sendMessage(message) {
  try {
    const jsonMessage = JSON.stringify(message)
    console.log(jsonMessage)
    await sendChannel.sendToQueue(checkoutQueue, Buffer.from(jsonMessage), {
      persistent: true,
    })
    console.log(`Message sent to RabbitMQ: ${message}`)
  } catch (err) {
    console.error(`Error sending message to RabbitMQ: ${err}`)
  }
}

const port = process.env.PORT || 8003

app.use(cors())
app.use(express.json())

app.post('/checkout', async (req, res) => {
  try {
    if (!sendConnection) {
      res.status(500).json({ message: 'Internal server error' })
    }
    await sendMessage(req.body)
    console.log('Message sent to RabbitMQ')
    res.status(200).json({ message: 'ได้รับรายการแล้ว' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`Server is start at http://localhost:${port}`)
})
