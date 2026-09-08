import express from 'express';
import demoRoutes from './routes/demoRoutes.js';
import lxRoutes from './routes/lxRoutes.js';

const app = express();

app.use(express.json());

// Local dev only: allow the frontend kit (localhost:3020) to call this API
// directly. RishiVerse handles CORS/proxying in production — not part of handoff.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-lx-actor-ref');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'rishiverse-backend-module-scaffold ok' });
});

// In RishiVerse this sits under authRouter at /api/v1
const apiRouter = express.Router();
apiRouter.use('/demo', demoRoutes);
apiRouter.use('/lx', lxRoutes);
app.use('/api/v1', apiRouter);

export default app;
