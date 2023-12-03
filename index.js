const express = require('express')
const app = express()
const productRoute = require('./route/product.route')
const txnRoute = require('./route/txn.route')
const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())
app.use('/product', productRoute)
app.use('/txn', txnRoute)

app.listen(port, () => {
  console.log(`Server is start at http://localhost:${port}`)
})
