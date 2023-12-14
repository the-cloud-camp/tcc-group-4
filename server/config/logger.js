const LokiTransport = require("winston-loki")
const { createLogger, format, transports } = require("winston")
const { combine, timestamp, label, printf, json } = format;

let logger;

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const initializeLogger = () => {
  if (logger) {
    return;
  }

  const logFormat = combine(format.simple(), timestamp())

  logger = createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports: [
      new LokiTransport({
        host: "http://loki:3100",
        labels: { app: "group-4" },
        json: true,
        format: json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error(err),
      }),
      new transports.Console({
        logFormat,
      }),
    ],
  });
};

const getLogger = () => {
  initializeLogger();
  return logger;
};

module.exports = {getLogger}
