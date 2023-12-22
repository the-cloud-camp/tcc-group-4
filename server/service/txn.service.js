const { Prisma, PrismaClient } = require('@prisma/client')
const { processPayment } = require('./payment.service')
// const fs = require('fs')
// const logfilepath = '../logs/transaction_logs.txt'
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
    orderBy: {
      createdAt: 'desc',
    },
  })
  return data
}

const createTxnService = async (txnInput) => {
  let createdTxn

  const { email, item, txnAmount, products } = txnInput
  if (!email) throw new Error('Email is required')
  if (!item) throw new Error('Item is required')
  if (!txnAmount) throw new Error('Transaction amount is required')
  if (!products) throw new Error('Products are required')
  try {
    createdTxn = await prisma.transaction.create({
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
    //process reserve stock
    const tx = await prisma.$transaction(
      async (prisma) => {
        for (let i = 0; i < products.length; i++) {
          console.log(`processing product ${products[i].id}`)
          const product = products[i]

          try {
            // Retrieve the current stock
            const currentProduct = await prisma.product.findUnique({
              where: {
                productId: product.id,
              },
              select: {
                stock: true,
              },
            })

            console.log({ currentStock: currentProduct.stock })

            // Check stock
            if (!currentProduct || currentProduct.stock <= 0) {
              console.log('insufficient stock')
              throw new Error(`Insufficient stock for product ID ${product.id}`)
            }

            // Update stock
            await prisma.product.update({
              where: {
                productId: product.id,
                stock: {
                  gt: 0,
                },
              },
              data: {
                stock: {
                  decrement: 1,
                },
              },
            })
          } catch (err) {
            throw new Error(`${err.message}`)
          }
        }
        return true
      },
      {
        timeout: 15000,
      },
    )

    return {
      isReserve: tx,
      createdTxn,
    }
  } catch (err) {
    // fs.appendFileSync(logfilepath, `error ${txnId} :  ${err.message}\n`)
    console.log(`error processing transaction ${err.message}`)
    if (!createdTxn) throw new Error(`Error creating transaction`)

    createdTxn = await prisma.transaction.update({
      where: {
        txnId: createdTxn.txnId,
      },
      data: {
        txnStatus: 'FAILED',
      },
    })

    return {
      isReserve: false,
      createdTxn,
    }
  }
}

function formatDuration(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor(duration / (1000 * 60 * 60))

  const formattedDuration = `${hours} hours, ${minutes} minutes, ${seconds} seconds`

  return formattedDuration
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
              place: true,
              eventDate: true,
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
    await prisma.transaction.update({
      where: {
        txnId,
      },
      data: {
        txnStatus: 'SUCCESS',
      },
    })

    // fs.appendFileSync(logfilepath, `database update: ${txnId} : SUCCESS\n`)
  } catch (err) {
    // fs.appendFileSync(logfilepath, `error ${txnId} :  ${err.message}\n`)
    return new Error(`error processing transaction ${err.message}`)
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
      place: p.product.place,
      eventDate: p.product.eventDate,
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
