const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/health
// Used by: Docker HEALTHCHECK, AWS ALB, GitHub Actions, monitoring tools
router.get('/', (req, res) => {
  // Check database connection state
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  const isHealthy = dbState === 1;

  const healthData = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'unknown'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    version: process.env.npm_package_version || '1.0.0'
  };

  // Return 200 if healthy, 503 if degraded
  res.status(isHealthy ? 200 : 503).json(healthData);
});

module.exports = router;