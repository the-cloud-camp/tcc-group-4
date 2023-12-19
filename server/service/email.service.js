const nodemailer = require('nodemailer')
const { sendQueueEmail } = require('../rabbitmq')

const sendEmail = async (emailContext) => {
  try {
    const res = await sendQueueEmail(emailContext)
    return res
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

module.exports = { sendEmail, sendingEmail }
