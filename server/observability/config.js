const LokiTransport = require("winston-loki");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, json } = format;
const { NodeSDK } = require("@opentelemetry/sdk-node");
const opentelemetry = require("@opentelemetry/api");

const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");

const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-proto");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-proto");
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
  MeterProvider,
} = require("@opentelemetry/sdk-metrics");

function configureLogger(name) {
  const logFormat = combine(format.json(), timestamp());

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

function configureTracer(name) {
  const trace = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: name,
    }),
    traceExporter: new OTLPTraceExporter(),
  });
  return trace;
}

function configureMeter(name) {
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: name,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),

    exportIntervalMillis: 3000,
  });

  const myServiceMeterProvider = new MeterProvider({
    resource: resource,
  });

  myServiceMeterProvider.addMetricReader(metricReader);

  return opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
}
module.exports = {
  configureLogger,
  configureTracer,
  configureMeter,
};
