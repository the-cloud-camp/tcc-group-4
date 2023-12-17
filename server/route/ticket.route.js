const express = require('express')
const { redeemTicketController } = require('../controller/ticket.controller')
const router = express.Router()

router.post('/redeem', redeemTicketController)

module.exports = router
