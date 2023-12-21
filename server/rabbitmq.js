var updateChannel, paymentChannel, emailChannel
const paymentQueue = 'tcc-group-4-payment1'
const emailQueue = 'tcc-group-4-email1'
const updateQueue = 'tcc-group-4-update-transaction1'
let RabbitMQConnection, isRabbitMQConnected

const createChannel = async (connection, isConnected) => {
  RabbitMQConnection = connection
  isRabbitMQConnected = isConnected
  paymentChannel = await connection.createChannel()
  emailChannel = await connection.createChannel()
  updateChannel = await connection.createChannel()

  paymentChannel.assertQueue(paymentQueue, {
    durable: true,
  })

  emailChannel.assertQueue(emailQueue, {
    durable: true,
  })

  updateChannel.assertQueue(updateQueue, {
    durable: true,
  })
  console.log('connected to rabbitmq')

  return { paymentChannel, emailChannel, updateChannel }
}

const sendQueuePayment = async (message) => {
  try {
    const jsonMessage = JSON.stringify(message)

    await paymentChannel.sendToQueue(paymentQueue, Buffer.from(jsonMessage), {
      persistent: true,
    })

    console.log(`Message sent to Payment Queue: ${message}`)
    return true
  } catch (err) {
    console.error(`Error sending message to Payment Queue: ${err}`)
    return false
  }
}

const sendQueueEmail = async (message) => {
  try {
    const jsonMessage = JSON.stringify(message)

    await emailChannel.sendToQueue(emailQueue, Buffer.from(jsonMessage), {
      persistent: true,
    })

    console.log(`Message sent to Email Queue: ${message}`)
    return true
  } catch (err) {
    console.error(`Error sending message to Email Queue: ${err}`)
    return false
  }
}
function isRabbitMQConnectedFunc() {
  return RabbitMQConnection && isRabbitMQConnected
}

function updateRabbitMQConnection(connection, isConnected) {
  RabbitMQConnection = connection
  isRabbitMQConnected = isConnected
}

module.exports = {
  createChannel,
  sendQueuePayment,
  sendQueueEmail,
  isRabbitMQConnectedFunc,
  updateRabbitMQConnection,
}
