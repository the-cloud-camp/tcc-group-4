const logError = (err, req, res, next) => {
  const initTrace = configureTracer("group-4");
  initTrace.start();
  const initMetric = configureMeter("group-4");
  const logger = new LokiHandler("group-4");

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
  logger.emit({
    level: "ERROR",
    message: `method=${method} url=${url} status=${status} error=${err.stack}`,
    labels: { origin: "api" },
  });

  next();
};

module.exports = { logError };
