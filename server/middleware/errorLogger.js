const { configureLogger } = require("../observability/config");

const logError = (err, req, res, next) => {
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;

  const logger = configureLogger("group-4");
  logger.error({
    message: `method=${method} url=${url} status=${status} error=${err.stack}`,
    labels: { origin: "api" },
  });
  next();
};

module.exports = { logError };
