const processPayment = async () => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 12000)
  }).then((result) => {
    return result
  })
}

module.exports = {
  processPayment,
}
