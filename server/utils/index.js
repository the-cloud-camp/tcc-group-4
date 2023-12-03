const standardResponse = (data, status = 200) => {
  return {
    code: status,
    message: data.message ?? data.errorMessage,
    timestamp: new Date().toISOString(),
    data: data,
  }
}

module.exports = {
  standardResponse,
}
