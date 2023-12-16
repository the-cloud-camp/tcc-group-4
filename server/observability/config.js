const LokiTransport = require("winston-loki");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, json } = format;

function configureLogger(name, version) {
  const logFormat = combine(format.simple(), timestamp());

  const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  };

  const logger = createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports: [
      new LokiTransport({
        host: "http://localhost:3100",
        labels: { job: name },
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

  return logger;
}

module.exports = {
  configureLogger,
};
