const { sendQueuePayment } = require('../rabbitmq')

const processPayment = async (message) => {
  try {
    const res = await sendQueuePayment(message)
    return res
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  processPayment,
}
