const { Prisma, PrismaClient } = require('@prisma/client')
const { processPayment } = require('./payment.service')

const prisma = new PrismaClient()

const getAllTxnsService = async () => {
  const data = await prisma.transaction.findMany({
    select: {
      txnId: true,
      email: true,
      item: true,
      txnAmount: true,
      createdAt: true,
      txnStatus: true,
    },
  })
  return data
}

const createTxnService = async (txnInput) => {
  const { email, item, txnAmount, products } = txnInput
  if (!email) throw new Error('Email is required')
  if (!item) throw new Error('Item is required')
  if (!txnAmount) throw new Error('Transaction amount is required')
  if (!products) throw new Error('Products are required')
  try {
    const createdTxn = await prisma.transaction.create({
      data: {
        email,
        item,
        txnAmount,
        txnStatus: 'PENDING',
        productTransactions: {
          create: products.map((product) => ({
            product: {
              connect: {
                productId: product.id,
              },
            },
          })),
        },
      },
    })
    console.log({ createdTxnId: createdTxn.txnId })
    const isReserve = await reserveProductAndPayService(
      products,
      createdTxn.txnId,
      txnAmount,
    )
    return {
      isReserve,
      ...createdTxn,
    }
  } catch (err) {
    console.log(err)
    throw new Error(`error creating transaction ${err.message}`)
  }
}

const reserveProductAndPayService = async (products, txnId, txnAmount) => {
  try {
    const tx = await prisma.$transaction(
      async (prisma) => {
        for (let i = 0; i < products.length; i++) {
          console.log(`processing product ${products[i].id}`)
          const product = products[i]
          // Retrieve the current stock
          const currentProduct = await prisma.product.findUnique({
            where: {
              productId: product.id,
            },
            select: {
              stock: true,
            },
          })

          // Check stock
          if (!currentProduct || currentProduct.stock == 0) {
            console.log('insufficient stock')
            throw new Error(`Insufficient stock for product ID ${product.id}`)
          }

          await prisma.product.update({
            where: {
              productId: product.id,
            },
            data: {
              stock: {
                decrement: 1,
              },
            },
          })
        }
        return true
      },
      {
        timeout: 15000,
      },
    )

    return tx
  } catch (err) {
    console.log(`error processing transaction ${err.message}`)
  }
}

const getTxnByTxnIdService = async (txnId) => {
  const data = await prisma.transaction.findUnique({
    where: {
      txnId,
    },
    select: {
      txnId: true,
      item: true,
      txnAmount: true,
      createdAt: true,
      txnStatus: true,
      productTransactions: {
        select: {
          id: true,
          isRedeemed: true,
          product: {
            select: {
              productId: true,
              productName: true,
              productDescription: true,
              productImage: true,
              price: true,
            },
          },
        },
      },
    },
  })

  return manipulateData(data)
}

const updateTxnSuccessStatusService = async (txnId) => {
  try {
    const tx = await prisma.$transaction(async (prisma) => {
      await prisma.transaction.update({
        where: {
          txnId,
        },
        data: {
          txnStatus: 'SUCCESS',
        },
      })
    })
  } catch (err) {
    console.log(`error processing transaction ${err.message}`)
  }
}

const rollbackTxnService = async (txnId) => {
  try {
    return await prisma.$transaction(async (prisma) => {
      await prisma.transaction.update({
        where: {
          txnId,
        },
        data: {
          txnStatus: 'FAILED',
        },
      })

      const txnProductIds = await prisma.productTransaction.findMany({
        where: {
          transactionId: txnId,
        },
        select: {
          productId: true,
          quantity: true,
        },
      })

      for (let i = 0; i < txnProductIds.length; i++) {
        const product = txnProductIds[i]
        await prisma.product.update({
          where: {
            productId: product.productId,
          },
          data: {
            stock: {
              increment: product.quantity,
            },
          },
        })
      }

      return 'Transaction Successfully Rolled Back'
    })
  } catch (err) {
    return new Error(`error processing transaction ${err.message}`)
  }
}

const manipulateData = (data) => {
  return {
    txnId: data.txnId,
    email: data.email,
    item: data.item,
    txnAmount: data.txnAmount,
    createdAt: data.createdAt,
    txnStatus: data.txnStatus,
    products: data.productTransactions.map((p) => ({
      ticketId: p.id,
      isRedeemed: p.isRedeemed,
      productId: p.product.productId,
      productName: p.product.productName,
      productDescription: p.product.productDescription,
      productImage: p.product.productImage,
      price: p.product.price,
    })),
  }
}

module.exports = {
  getAllTxnsService,
  createTxnService,
  updateTxnSuccessStatusService,
  rollbackTxnService,
  getTxnByTxnIdService,
}
