const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const redeemTicketService = async (ticketId) => {
  return await prisma.productTransaction.update({
    where: {
      id: ticketId,
    },
    data: {
      isRedeemed: true,
    },
  })
}

module.exports = {
  redeemTicketService,
}
