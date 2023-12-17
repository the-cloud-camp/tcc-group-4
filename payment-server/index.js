const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const amqp = require('amqplib')
const sendQueue = 'tcc-group-4-update-transaction1'
const receiveQueue = 'tcc-group-4-payment1'
const connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5672'
var receiveChannel, sendChannel, connection

connectQueue()
async function connectQueue() {
  try {
    connection = await amqp.connect(`amqp://${connectionSvc}`)
    sendChannel = await connection.createChannel()
    receiveChannel = await connection.createChannel()
    sendChannel.assertQueue(sendQueue, {
      durable: true,
    })

    receiveChannel.assertQueue(receiveQueue, {
      durable: true,
    })
    receiveChannel.prefetch(1)

    receiveChannel.consume(receiveQueue, async (message) => {
      if (message) {
        console.log(` ${message.content.toString()}`)
        const messageBody = JSON.parse(message.content.toString())
        const txn = {
          txnStatus: 'SUCCESS',
          ...messageBody,
        }
        console.log(`Message received from RabbitMQ: ${JSON.stringify(txn)}`)
        await sendMessage(txn)
        receiveChannel.ack(message)
      }
    })
  } catch (err) {
    console.log(err)
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
