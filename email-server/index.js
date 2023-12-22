const express = require('express')
const amqp = require('amqplib')
const cors = require('cors')
require('dotenv').config()

const nodemailer = require('nodemailer')
const app = express()

const receiveQueue = 'tcc-group-4-email1'
let receiveChannel, connection
const connectionSvc = process.env.RABBITMQ_SVC || 'localhost:5672'
const appUrl = process.env.APP_URL || 'http://127.0.0.1:5173'

connectQueue()

async function connectQueue() {
  try {
    connection = await amqp.connect(`amqp://${connectionSvc}`)

    connection.on('error', (err) => {
      if (err.message.includes('Connection closed')) {
        console.error('Connection closed, reconnecting...')
        setTimeout(connectQueue, 5000) // Retry connection
      } else {
        console.error('Connection error:', err.message)
      }
    })

    receiveChannel = await connection.createChannel()
    console.log('connected to rabbitmq')

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
      await sendingEmail(getEmailContext(messageBody))
      console.log('Email sent')
      receiveChannel.ack(message)
    }
  })

  receiveChannel.on('close', () => {
    console.error('Channel closed, reconnecting...')
    setTimeout(connectQueue, 5000)
  })

  receiveChannel.on('error', (error) => {
    console.error('Channel error:', error.message)
  })
}

const getEmailContext = (messageBody) => {
  const txnDetailUrl = `${appUrl}?txn=${messageBody.txnId}`

  return {
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
            <p><strong>Phone Number:</strong> ${messageBody.txn.phoneNumber}</p>
            <p><strong>Transaction Amount:</strong> $${messageBody.txn.txnAmount.toFixed(
              2,
            )}</p>

            <!-- Payment Button -->
            <a href="${txnDetailUrl}" class="button-link">Detail</a>
        </body>
        </html>
    `,
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
