import express from 'express';
import demoRoutes from './routes/demoRoutes.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'rishiverse-backend-module-scaffold ok' });
});

// In RishiVerse this sits under authRouter at /api/v1
const apiRouter = express.Router();
apiRouter.use('/demo', demoRoutes);
app.use('/api/v1', apiRouter);

export default app;
