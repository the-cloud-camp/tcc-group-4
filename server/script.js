const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createMockData() {
  // Generate mock products
  for (let i = 1; i <= 10; i++) {
    await prisma.product.create({
      data: {
        productName: `Product ${i}`,
        productDescription: `Description for Product ${i}`,
        productImage: `image_${i}.jpg`,
        price: Math.random() * 100,
        stock: Math.floor(Math.random() * 50),
      },
    })
  }

  // Generate mock transactions
  for (let i = 1; i <= 5; i++) {
    const transaction = await prisma.transaction.create({
      data: {
        email: `123456789${i}@gmail.com`,
        item: 8,
        txnAmount: Math.random() * 1000,
        txnStatus: 'PENDING',
      },
    })

    let count = 1
    let j = 5
    while (j < 10) {
      await prisma.productTransaction.create({
        data: {
          transactionId: transaction.txnId,
          productId: j,
        },
      })
      count++
      if (count == 3) {
        j++
        count = 1
      }
    }

    const product = await prisma.productTransaction.findMany({
      where: {
        transactionId: transaction.txnId,
      },
      select: {
        productId: true,
      },
    })

    await prisma.transaction.update({
      where: {
        txnId: transaction.txnId,
      },
      data: {
        item: product.length,
      },
    })
  }
}

createMockData()
  .catch((e) => {
    console.log(e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
