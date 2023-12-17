const express = require('express')
const app = express()
const productRoute = require('./route/product.route')
const txnRoute = require('./route/txn.route')
const cors = require('cors')
require('dotenv').config()

const { createChannel } = require('./rabbitmq')
const { updateTxnController } = require('./controller/txn.controller')

var paymentChannel, emailChannel, updateChannel
const updateQueue = 'tcc-group-4-update-transaction1'

connectQueue()
async function connectQueue() {
  try {
    const channel = await createChannel()
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
