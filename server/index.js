const express = require("express");
const amqp = require("amqplib");
const cors = require("cors");
require("dotenv").config();
const productRoute = require("./route/product.route");
const txnRoute = require("./route/txn.route");
const ticketRoute = require("./route/ticket.route");
const {
  updateRabbitMQConnection,
  createProducerChannel,
  createConsumerChannel,
} = require("./rabbitmq");
const { updateTxnController } = require("./controller/txn.controller");
const app = express();

let connectionSvc = process.env.RABBITMQ_SVC || "localhost:5672";
let paymentChannel, emailChannel, updateChannel;
const updateQueue = "tcc-group-4-update-transaction1";
let isConnected = false;

connectQueue();
async function connectQueue() {
  try {
    const connection = await amqp.connect(`amqp://${connectionSvc}`);
    const consumerConnection = await amqp.connect(`amqp://${connectionSvc}`);
    isConnected = true;
    updateRabbitMQConnection(connection, isConnected);

    connection.on("close", () => {
      console.log("connection closed");
      isConnected = false;
      updateRabbitMQConnection(connection, isConnected);
      startInterval();
    });

    connection.on("error", () => {
      console.log("connection error");
      isConnected = false;
      updateRabbitMQConnection(connection, isConnected);
      startInterval();
    });

    consumerConnection.on("close", () => {
      console.log("connection closed");
      isConnected = false;
      updateRabbitMQConnection(consumerConnection, isConnected);
      startInterval();
    });

    consumerConnection.on("error", () => {
      console.log("connection error");
      isConnected = false;
      updateRabbitMQConnection(consumerConnection, isConnected);
      startInterval();
    });

    const channel = await createProducerChannel(connection, isConnected);
    const consumerChannel = await createConsumerChannel(
      consumerConnection,
      isConnected
    );
    paymentChannel = channel.paymentChannel;
    emailChannel = channel.emailChannel;
    updateChannel = consumerChannel.updateChannel;

    updateChannel.prefetch(1);
    updateChannel.consume(
      updateQueue,
      async (message) => {
        try {
          if (message && updateChannel) {
            const messageBody = JSON.parse(message.content.toString());
            console.log(`Message received from RabbitMQ: ${messageBody}`);
            await updateTxnController(messageBody);
            updateChannel.ack(message);
          }
        } catch (err) {
          console.log(err);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (err) {
    console.log(err);
    startInterval();
  }
}

const port = process.env.PORT || 8000;
const responseTime = require("response-time");

const init = () => {
  app.use(cors());
  app.use(express.json());
  app.use(responseTime(logResponseTime));
  app.use("/product", productRoute);
  app.use("/txn", txnRoute);
  app.use("/ticket", ticketRoute);

  app.get("/health", (req, res) => {
    return res.send("OK");
  });

  app.use(logError);
  app.listen(port, () => {
    console.log(`Server is start at http://localhost:${port}`);
  });
};

const startInterval = () => {
  const intervalId = setInterval(() => {
    if (isConnected) {
      console.log("RabbitMQ is connected. Stop checking.");
      clearInterval(intervalId);
    } else {
      console.log("RabbitMQ is not connected. Attempting to reconnect...");
      connectQueue();
    }
  }, 1000);
};

startInterval();
init();
