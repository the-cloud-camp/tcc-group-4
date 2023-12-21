const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS=0;`
    await prisma.$executeRaw`TRUNCATE TABLE Transaction;`
    await prisma.$executeRaw`TRUNCATE TABLE ProductTransaction;`
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS=1;`
  } catch (e) {
    console.log(e)
  }
}

clearDatabase()
