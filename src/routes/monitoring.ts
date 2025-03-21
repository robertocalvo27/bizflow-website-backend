import { Router } from 'express';
import { metrics } from '../utils/metrics';
import logger from '../utils/logger';
import os from 'os';

const router = Router();

// Endpoint de health check
router.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : 'Error';
    res.status(503).send();
  }
});

// Endpoint de métricas
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  } catch (error) {
    logger.error('Error collecting metrics:', error);
    res.status(500).end();
  }
});

// Endpoint de estado del sistema
router.get('/status', (req, res) => {
  const status = {
    system: {
      arch: os.arch(),
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpus: os.cpus().length
    },
    process: {
      pid: process.pid,
      version: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    },
    timestamp: Date.now()
  };
  res.json(status);
});

// Endpoint de logs (requiere autenticación)
router.get('/logs', (req, res) => {
  // TODO: Implementar autenticación
  const logPath = 'logs/combined-' + new Date().toISOString().split('T')[0] + '.log';
  res.download(logPath, (err) => {
    if (err) {
      logger.error('Error downloading logs:', err);
      res.status(404).send('Log file not found');
    }
  });
});

export default router; 