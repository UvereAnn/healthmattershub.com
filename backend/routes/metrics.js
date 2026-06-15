const express = require('express');
const { register } = require('../middleware/metrics');

const router = express.Router();

// GET /api/metrics
// Returns all metrics in Prometheus text format
// Prometheus scrapes this endpoint every 15 seconds
// Format example:
// healthblog_http_requests_total{method="GET",route="/api/posts",status_code="200"} 42
router.get('/', async (req, res) => {
  try {
    // Set content type that Prometheus expects
    res.set('Content-Type', register.contentType);

    // Get all metrics as text
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

module.exports = router;