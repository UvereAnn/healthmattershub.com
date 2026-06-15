const promClient = require('prom-client');

// ── Create a Registry ────────────────────────
// Registry holds all your metrics
// Like a container for all the things you want to measure
const register = new promClient.Registry();

// ── Default Metrics ──────────────────────────
// Automatically collects Node.js built-in metrics:
// - CPU usage
// - Memory usage (heap used, heap total, external)
// - Event loop lag
// - Active handles and requests
// - Garbage collection stats
promClient.collectDefaultMetrics({
  register,
  prefix: 'healthblog_', // all metric names start with this
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// ── Custom Metrics ───────────────────────────

// 1. HTTP Request Counter
// Counts total number of requests
// Labels let you filter by method, route, status code
const httpRequestsTotal = new promClient.Counter({
  name: 'healthblog_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// 2. HTTP Request Duration
// Measures how long each request takes
// Histogram buckets in seconds
const httpRequestDuration = new promClient.Histogram({
  name: 'healthblog_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register]
});

// 3. Active HTTP Connections
// How many requests are being processed right now
const activeConnections = new promClient.Gauge({
  name: 'healthblog_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register]
});

// 4. HTTP Error Counter
// Counts only 4xx and 5xx responses
const httpErrorsTotal = new promClient.Counter({
  name: 'healthblog_http_errors_total',
  help: 'Total number of HTTP errors (4xx and 5xx)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// 5. Database Operation Duration
// How long MongoDB queries take
const dbOperationDuration = new promClient.Histogram({
  name: 'healthblog_db_operation_duration_seconds',
  help: 'Duration of database operations in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register]
});

// ── Middleware Function ───────────────────────
// This runs on EVERY request
// Records timing and counts
const metricsMiddleware = (req, res, next) => {
  // Skip metrics endpoint itself to avoid infinite loop
  if (req.path === '/api/metrics') return next();

  // Start timing this request
  const startTime = Date.now();

  // Increment active connections
  activeConnections.inc();

  // Clean up the route for labeling
  // Replaces dynamic IDs like /posts/abc123 with /posts/:id
  // Without this each unique ID creates a new metric label
  // which would create millions of labels over time
  const route = req.route
    ? req.baseUrl + req.route.path
    : req.path.replace(/\/[a-f0-9]{24}/g, '/:id')
               .replace(/\/\d+/g, '/:id');

  // When response finishes record the metrics
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = res.statusCode.toString();
    const method = req.method;

    // Record request count
    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode
    });

    // Record request duration
    httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration
    );

    // Record errors (4xx and 5xx only)
    if (res.statusCode >= 400) {
      httpErrorsTotal.inc({
        method,
        route,
        status_code: statusCode
      });
    }

    // Decrement active connections
    activeConnections.dec();
  });

  next();
};

module.exports = {
  register,
  metricsMiddleware,
  metrics: {
    httpRequestsTotal,
    httpRequestDuration,
    activeConnections,
    httpErrorsTotal,
    dbOperationDuration
  }
};