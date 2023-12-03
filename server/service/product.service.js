const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const createProductService = async (product) => {
  const {
    productName,
    productDescription,
    productImage,
    price,
    stock,
  } = product

  if (!productName) throw new Error('Product name is required')
  if (!productDescription) throw new Error('Product description is required')
  if (!productImage) throw new Error('Product image is required')
  if (!price) throw new Error('Product price is required')
  if (!stock) throw new Error('Product stock is required')

  return await prisma.product.create({
    data: {
      productName,
      productDescription,
      productImage,
      price,
      stock,
    },
  })
}

const getProductService = async (productId) => {
  productId = parseInt(productId)
  return await prisma.product.findUnique({
    where: {
      productId,
    },
  })
}

const getAllProductsService = async () => {
  return await prisma.product.findMany()
}

const updateProductService = async (product) => {
  const {
    productId,
    productName,
    productDescription,
    productImage,
    price,
    stock,
  } = product

  const updateData = {}

  if (productName) updateData.productName = productName
  if (productDescription) updateData.productDescription = productDescription
  if (productImage) updateData.productImage = productImage
  if (price) updateData.price = price
  if (stock) updateData.stock = stock

  return await prisma.product.update({
    where: {
      productId,
    },
    data: updateData,
  })
}

const deleteProductService = async (productId) => {
  return await prisma.product.delete({
    where: {
      productId,
    },
  })
}
module.exports = {
  createProductService,
  getProductService,
  getAllProductsService,
  updateProductService,
  deleteProductService,
}