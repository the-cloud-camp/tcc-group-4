const {
  configureLogger,
  configureTracer,
  configureMeter,
} = require("../observability/config");
const opentelemetry = require("@opentelemetry/api");
const { trace } = require("@opentelemetry/api");

const logResponseTime = (req, res, time) => {
  const initTrace = configureTracer("group-4");
  initTrace.start();
  const initMetric = configureMeter("group-4");
  const logger = configureLogger("group-4");

  let method = req.method;
  let url = req.originalUrl;
  let status = res.statusCode;
  const myMeter = opentelemetry.metrics.getMeter("group-4");

  const tracer = trace.getTracer("group-4");

  const counter = myMeter.createCounter("events.counts");
  counter.add(1);
  let traceId = "";
  tracer.startActiveSpan(url, (span) => {
    traceId = span._spanContext.traceId;
    span.end();
  });
  logger.info({
    message: `method=${method} url=${url} status=${status} duration=${time}ms`,
    labels: { origin: "api" },
    traceId,
  });
};

module.exports = { logResponseTime };
