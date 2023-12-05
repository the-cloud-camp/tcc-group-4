const { sendingEmail } = require("../service/email.service");
const {
  createTxnService,
  updateTxnSuccessStatusService,
  getAllTxnsService,
  rollbackTxnService,
  getTxnByTxnIdService,
} = require("../service/txn.service");

const getAllTxnsController = async (req, res) => {
  try {
    const data = await getAllTxnsService();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTxnController = async (req, res) => {
  try {
    const data = await createTxnService(req.body.txn);
    const mail = await sendingEmail({
      email: req.body.txn.email,
      subject: `Payment ${req.body.txn.email}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Invoice</title>
        </head>
        <body>
            <h2>Invoice Details</h2>
            <p><strong>Email:</strong> ${req.body.txn.email}</p>
            <p><strong>Item:</strong> ${req.body.txn.item}</p>
            <p><strong>Phone Number:</strong> ${req.body.txn.phoneNumber}</p>
            <p><strong>Transaction Amount:</strong> $${req.body.txn.txnAmount.toFixed(
              2
            )}</p>
            
            <h3>Products</h3>
            <ul>
                <li>
                    <p><strong>Product ID:</strong> ${
                      req.body.txn.products[0].id
                    }</p>
                </li>
                <!-- Add more product details if available -->
            </ul>

            <!-- Payment Button -->
            <form action="YOUR_PAYMENT_ENDPOINT" method="post">
                <!-- Add any necessary payment form fields here -->
                <button type="submit">Make Payment</button>
            </form>
        </body>
        </html>
    `,
    });
    res.json({ ...data, ...{ messageId: mail.messageId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTxnController = async (req, res) => {
  const { txnStatus, txnId } = req.body.txn;
  try {
    if (txnStatus === "SUCCESS") {
      await updateTxnSuccessStatusService(txnId);
    } else {
      await rollbackTxnService(txnId);
    }
    res.json({ message: "Transaction updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTxnByTxnIdController = async (req, res) => {
  try {
    const data = await getTxnByTxnIdService(req.params.txnId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllTxnsController,
  createTxnController,
  updateTxnController,
  getTxnByTxnIdController,
};
