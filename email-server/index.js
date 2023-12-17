const express = require('express')
const amqp = require('amqplib')
const cors = require('cors')
require('dotenv').config()

const nodemailer = require('nodemailer')
const app = express()

const receiveQueue = 'tcc-group-4-email1'
let receiveChannel, connection
const connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5672'
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

    receiveChannel = await connection.createChannel()
    console.log('connected to rabbitmq')

    receiveChannel.assertQueue(receiveQueue, {
      durable: true,
    })
    receiveChannel.prefetch(1)

    receiveChannel.consume(receiveQueue, async (message) => {
      if (message) {
        console.log(` ${message.content.toString()}`)
        const messageBody = JSON.parse(message.content.toString())
        console.log(
          `Message received from RabbitMQ: ${JSON.stringify(
            message.content.toString(),
          )}`,
        )
        console.log(messageBody)

        await sendingEmail({
          email: messageBody.txn.email,
          subject: `Payment ${messageBody.txn.email}`,
          html: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Email Invoice</title>
              </head>
              <body>
                  <h2>Invoice Details</h2>
                  <p><strong>Email:</strong> ${messageBody.txn.email}</p>
                  <p><strong>Item:</strong> ${messageBody.txn.item}</p>
                  <p><strong>Phone Number:</strong> ${
                    messageBody.txn.phoneNumber
                  }</p>
                  <p><strong>Transaction Amount:</strong> $${messageBody.txn.txnAmount.toFixed(
                    2,
                  )}</p>

                  <!-- Payment Button -->
                  <form action="YOUR_PAYMENT_ENDPOINT" method="post">
                      <!-- Add any necessary payment form fields here -->
                      <button type="submit">Detail</button>
                  </form>
              </body>
              </html>
          `,
        })
        console.log('Email sent')
        receiveChannel.ack(message)
      }
    })
  } catch (err) {
    console.log(err)
  }
}

const sendingEmail = async (emailContext) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    secure: true,
    host: 'smtp.gmail.com',
    auth: {
      user: 'jettapat.th@gmail.com',
      pass: 'wxnu ayvn zkxq pkvq',
    },
  })

  const { email, subject, text, html } = emailContext
  const mailData = {
    from: 'jettapat.th@gmail.com',
    to: email,
    subject,
    text,
    html,
  }

  try {
    return await transporter.sendMail(mailData)
  } catch (error) {
    throw error
  }
}

const port = process.env.PORT || 8002

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
