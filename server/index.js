const express = require("express");
const app = express();
const productRoute = require("./route/product.route");
const txnRoute = require("./route/txn.route");
const cors = require("cors");
require("dotenv").config();
const { logResponseTime } = require("./middleware/responseTimeLogger");
const { logError } = require("./middleware/errorLogger");
const port = process.env.PORT || 8000;
const responseTime = require("response-time");

const init = () => {
  app.use(cors());
  app.use(express.json());
  app.use(responseTime(logResponseTime));
  app.use("/product", productRoute);
  app.use("/txn", txnRoute);

  app.get("/health", (req, res) => {
    return res.send("OK");
  });

  app.use(logError);

  const server = app.listen(port, () => {
    console.log(`Server is start at http://localhost:${port}`);
  });

  return server;
};

init();
