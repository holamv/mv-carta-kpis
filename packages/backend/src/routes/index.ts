import { Router } from 'express';
import { healthCheckDb } from '../config/database.js';
import quejasRoutes from './quejas.routes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const dbOk = await healthCheckDb();
  res.status(dbOk ? 200 : 503).json({
    success: dbOk,
    data: { status: dbOk ? 'ok' : 'degraded', db: dbOk },
  });
});

router.use('/quejas', quejasRoutes);

export default router;
