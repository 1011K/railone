import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
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

// Initialize Google GenAI client if GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// ---------------------------------------------------------------------------
// AI API Endpoints
// ---------------------------------------------------------------------------

// 1. Task Decomposition API
app.post('/api/ai/decompose', async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const systemInstruction = `
You are an expert Indian Railways & Mumbai Suburban operations planner for RailOne Next.
Decompose the user's journey or travel situation into 2 to 4 prioritized, actionable commuter tasks.
Available Categories strictly one of:
- DISRUPTION_RECOVERY (Signal bunching, slow line diversion, delay inversion)
- JOURNEY_PLANNING (Leave-home window, platform transfer buffer, timetable check)
- BOOKING_TICKETING (UTS QR specimen, season ticket MST check, counter bypass)
- GRIEVANCE_RAILMADAD (Coach AC failure, cleanliness, security request)
- SAFETY_LOST_FOUND (RPF 139 SOS, ladies special alignment, lost baggage)
- STATION_AMENITIES (Escalator, wheelchair ramp, waiting room, cloakroom)
- COACH_POSITIONING (Luggage coach, handicap coach, ladies compartment position)
- CREW_OPERATIONS (Sectional clearance, motorman guard handover)

Available Priorities strictly one of:
- P0_CRITICAL (Immediate 0-5 min action / missed connection / signal freeze)
- P1_HIGH (Time-sensitive <30 min / leave home / platform change)
- P2_MEDIUM (Preparation today / ticket verification / coach position)
- P3_LOW (Post-journey feedback / amenity check)

Return ONLY valid JSON array of objects with keys:
"title" (string, max 8 words),
"description" (string, 1-2 sentences),
"category" (one of the 8 categories),
"priority" (one of the 4 priorities),
"dueTime" (optional string, e.g. "10:48" or "Immediate"),
"associatedTrain" (optional string, e.g. "95112" or "12123"),
"stationCode" (optional string, e.g. "DR" or "TNA")
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `Travel query: "${prompt}". Context: "${context || 'mumbai suburban'}"` }] }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text || '[]';
      const parsedTasks = JSON.parse(responseText);
      return res.json({ tasks: parsedTasks, source: 'gemini' });
    } catch (err: any) {
      console.error('Gemini decompose error:', err?.message || err);
    }
  }

  // Deterministic Domain Fallback
  const q = prompt.toLowerCase();
  const fallbackTasks = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (q.includes('delay') || q.includes('signal') || q.includes('late') || q.includes('crowd')) {
    fallbackTasks.push({
      title: 'Delay Inversion Rule [TIMETABLE MODEL]',
      description: 'Live operational feed unavailable. When fast lines encounter congestion, slow local corridors often provide faster transfers according to timetable models.',
      category: 'DISRUPTION_RECOVERY',
      priority: 'P0_CRITICAL',
      dueTime: 'Immediate',
      stationCode: 'CLA',
      provenance: 'DEMO'
    });
  }

  fallbackTasks.push({
    title: 'Scheduled Leave-Home Buffer Advisory',
    description: 'Allow standard walking buffer before scheduled departure. Verify platform headway indicators before departing origin.',
    category: 'JOURNEY_PLANNING',
    priority: 'P1_HIGH',
    dueTime: now,
    stationCode: 'TNA',
    provenance: 'SCHEDULED'
  });

  fallbackTasks.push({
    title: 'Pre-book Specimen UTS QR Ticket',
    description: 'Generate educational specimen ticket with test QR code for practice validation [DEMO].',
    category: 'BOOKING_TICKETING',
    priority: 'P2_MEDIUM',
    stationCode: 'DR',
    provenance: 'DEMO'
  });

  return res.json({
    tasks: fallbackTasks,
    source: 'deterministic_fallback',
    provenance: 'DEMO',
    feedStatusNotice: 'Operational feed unavailable. Showing scheduled/demo information only.'
  });
});

// 2. AI Copilot Chat API
app.post('/api/ai/copilot', async (req, res) => {
  const { query, history = [] } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const systemInstruction = `
You are the RailOne Next AI Travel Copilot for Indian Railways & Mumbai Suburban commuters.
You provide honest, highly knowledgeable advice on:
- Fast vs Slow local delay inversions (when a slow train beats a bunched fast train)
- Transfer buffers at major junctions like Dadar (7 min walk between CR Platform 8 and WR Platform 1)
- Legal boarding constraints (Section 138, MST season pass restrictions on Mail/Express trains like Deccan Queen)
- AC Local tariffs, crowds (morning peak 8:30-11:30 Southbound, evening peak Northbound)
- Specimen booking simulations and RailMadad grievance procedures.
Always be direct, empathetic, and specify actionable platform numbers and timings.
`;

  if (aiClient) {
    try {
      const formattedContents = history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }));
      formattedContents.push({
        role: 'user',
        parts: [{ text: query }]
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });

      return res.json({ reply: response.text || '', source: 'gemini' });
    } catch (err: any) {
      console.error('Gemini copilot error:', err?.message || err);
    }
  }

  // Deterministic Domain Fallback response
  const q = query.toLowerCase();
  let fallbackReply = `Namaste! Operational feed unavailable. Showing scheduled/demo information only [TIMETABLE MODEL]:\n\n`;
  if (q.includes('dadar') && q.includes('churchgate')) {
    fallbackReply += `If traveling from Thane to Churchgate via Dadar, alight at Dadar CR Platform 6/7, take the northern Foot Overbridge (FOB) across to Western Railway Platform 1/2. Allow at least 7 minutes walking buffer. An AC Fast Local is scheduled every 20-30 minutes.`;
  } else if (q.includes('ac') || q.includes('fare')) {
    fallbackReply += `Suburban AC Local fare for Thane to Dadar is ₹95 (Single Journey), compared to ₹10 for Second Class and ₹105 for First Class. Ordinary First Class season passes are NOT valid in AC Locals without AC surcharge coupon.`;
  } else if (q.includes('delay') || q.includes('late')) {
    fallbackReply += `Delay & Headway Advisory [TIMETABLE MODEL]: Live operational telemetry is unavailable. During peak-hour congestion, Slow Local services on local lines often avoid fast line bunching between Thane and Kurla. Check platform indicator boards for confirmed dispatch times.`;
  } else {
    fallbackReply += `For your route, check the Journey Decision Engine to view scheduled headways, interchanges, and legal ticket validity.`;
  }

  return res.json({
    reply: fallbackReply,
    source: 'deterministic_fallback',
    provenance: 'DEMO',
    feedStatusNotice: 'Operational feed unavailable. Showing scheduled/demo information only.'
  });
});

// 3. RailMadad Complaint Drafter API
app.post('/api/ai/grievance', async (req, res) => {
  const { complaintType, trainNumber, coachNumber, description } = req.body;

  const systemInstruction = `
You are the RailMadad grievance drafting assistant for Indian Railways passengers.
Draft a formal, concise, and structured complaint following official railway grievance standards.
Clearly label as a passenger draft template.
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `Issue: ${complaintType}, Train: ${trainNumber}, Coach: ${coachNumber}, Details: ${description || 'Not provided'}` }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      return res.json({ draft: response.text || '', source: 'gemini' });
    } catch (err: any) {
      console.error('Gemini grievance error:', err?.message || err);
    }
  }

  const fallbackDraft = `PASSENGER GRIEVANCE DRAFT TEMPLATE [DEMO / NOT SUBMITTED TO RAILMADAD]
Reference Category: ${complaintType || 'COACH_ELECTRICAL_FAILURE'}
Train Number: ${trainNumber || '95114 AC Local'}
Coach Number: ${coachNumber || 'AC-03'}
Incident Date/Time: ${new Date().toLocaleString('en-IN')}

INCIDENT DETAILS:
${description || 'Air conditioning system cooling malfunction reported inside passenger coach. High ambient temperature and heavy passenger load causing poor ventilation.'}

ROUTING DEPARTMENT (RECOMMENDED):
Senior Divisional Electrical Engineer (Rolling Stock / C&W), Central Railway Division.

REQUESTED CORRECTIVE ACTION:
Inspection and attendant service at next major halt (Dadar / CSMT).

DISCLAIMER: This is an educational draft template generated by RailOne Next. To submit an official grievance, please visit https://railmadad.indianrailways.gov.in or call 139.`;

  return res.json({ draft: fallbackDraft, source: 'deterministic_fallback' });
});

// 4. System Health Check
app.get('/api/health', (req, res) => {
  const health = checkSystemHealth(!!aiClient);
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

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`RailOne Next server running at http://0.0.0.0:${PORT} (Gemini AI: ${aiClient ? 'Active' : 'Deterministic Mode'})`);
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

