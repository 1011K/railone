import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { v1Router } from './src/backend/routes/v1';
import { rateLimiter } from './src/backend/middleware/rateLimit';
import { getDatabase } from './src/backend/database/db';
import { checkSystemHealth } from './src/backend/modules/health';

dotenv.config();

// Initialize server-side SQLite persistence
getDatabase();

const app = express();
app.use(express.json());
app.use(rateLimiter);
app.use('/api/v1', v1Router);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

import { AiProviderRouter } from './src/backend/modules/ai/aiProviderRouter';

// ---------------------------------------------------------------------------
// AI API Endpoints (Grounded Modular Free-Tier AI Provider Router)
// ---------------------------------------------------------------------------

// 1. Task Decomposition API
app.post('/api/ai/decompose', async (req, res) => {
  const { prompt, context, preferredProvider } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const result = await AiProviderRouter.getInstance().decomposeTasks(prompt.trim(), context, preferredProvider);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'DECOMPOSE_FAILED', message: err.message });
  }
});

// 2. AI Copilot Chat API
app.post('/api/ai/copilot', async (req, res) => {
  const { query, history = [], preferredProvider } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const result = await AiProviderRouter.getInstance().askCopilot(query.trim(), history, preferredProvider);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'COPILOT_FAILED', message: err.message });
  }
});

// 3. RailMadad Complaint Drafter API
app.post('/api/ai/grievance', async (req, res) => {
  const { complaintType, trainNumber, coachNumber, description, preferredProvider } = req.body;

  try {
    const result = await AiProviderRouter.getInstance().draftGrievance(
      complaintType,
      trainNumber,
      coachNumber,
      description,
      preferredProvider
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'GRIEVANCE_DRAFT_FAILED', message: err.message });
  }
});

// 4. System Health Check
app.get('/api/health', (req, res) => {
  const isAiConfigured = AiProviderRouter.getInstance().getProvidersHealth().some(p => p.configured && p.name !== 'deterministic');
  const health = checkSystemHealth(isAiConfigured);
  res.json(health);
});

// Express global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express Error Handler caught:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: err?.message || 'Server encountered an internal error' });
  }
});

// ---------------------------------------------------------------------------
// Server Frontend / Vite Middlewares Mount
// ---------------------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for HTML navigation in dev mode
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const fs = await import('fs');
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace?.(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const isAiActive = AiProviderRouter.getInstance().getProvidersHealth().some(p => p.configured && p.name !== 'deterministic');
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`RailOne Next server running at http://0.0.0.0:${PORT} (AI Providers: ${isAiActive ? 'Active' : 'Deterministic Mode'})`);
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down cleanly...');
    server.close(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down cleanly...');
    server.close(() => process.exit(0));
  });
}

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

