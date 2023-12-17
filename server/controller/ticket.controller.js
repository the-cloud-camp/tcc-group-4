const { redeemTicketService } = require('../service/ticket.service')

const redeemTicketController = async (req, res) => {
  try {
    if (!req.body.ticketId)
      return res.status(400).json({ error: 'Ticket ID is required' })
    const data = await redeemTicketService(req.body.ticketId)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = {
  redeemTicketController,
}
