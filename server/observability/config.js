const LokiTransport = require("winston-loki");
const { createLogger, format, transports, log } = require("winston");
const { combine, timestamp, label, printf, json } = format;
const { NodeSDK } = require("@opentelemetry/sdk-node");
const opentelemetry = require("@opentelemetry/api");
const axios = require("axios");

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

class LokiHandler {
  constructor(name) {
    this.name = name;
  }

  async emit(record) {
    try {
      const logEntry = this.format(record);

      const data = {
        streams: [
          {
            stream: {
              app: this.name,
              level: record.level,
              trace_id: record.trace_id,
            },
            values: [[String(Date.now() * Math.pow(10, 6)), logEntry]],
          },
        ],
      };

      const response = await axios.post(
        "https://logs-prod-020.grafana.net/loki/api/v1/push",
        data,
        {
          auth: {
            username: 766976,
            password:
              "glc_eyJvIjoiMTAxMjYzNCIsIm4iOiJ0ZXN0LXRlc3QiLCJrIjoiazRkSTZsZjk1YXZIMDBXalhjOUk1NTRYIiwibSI6eyJyIjoidXMifX0=",
          },
        }
      );
      console.log(JSON.stringify(data));
    } catch (err) {
      console.log(err);
    }
  }

  format(record) {
    return record.message;
  }
}

function configureTracer(name) {
  const trace = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: name,
    }),

    traceExporter: new OTLPTraceExporter({
      url: "http://shobteeprajump-obs-svc.group-4-obs:4318/v1/traces",
    }),
  });
  return trace;
}

function configureMeter(name) {
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: name,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: "http://shobteeprajump-obs-svc.group-4-obs:4318/v1/metrics",
    }),

    exportIntervalMillis: 3000,
  });

  const myServiceMeterProvider = new MeterProvider({
    resource: resource,
  });

  myServiceMeterProvider.addMetricReader(metricReader);

  return opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
}
module.exports = {
  LokiHandler,
  configureTracer,
  configureMeter,
};
