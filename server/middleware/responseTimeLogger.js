const { configureLogger } = require("../observability/config");

const logResponseTime = (req, res, time) => {
  const logger = configureLogger("group-4");
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;

  logger.info({
    message: `method=${method} url=${url} status=${status} duration=${time}ms`,
    labels: { origin: "api" },
  });
};

module.exports = { logResponseTime };
