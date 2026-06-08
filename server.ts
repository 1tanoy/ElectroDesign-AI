/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini SDK with telemetry header requested in skills
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const hasApiKey = !!geminiApiKey;

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * API Endpoint: AI Engineering Assistant Chat proxy
 */
app.post('/api/ai-chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, modelContext, conversationHistory } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message payload is required' });
      return;
    }

    if (!hasApiKey) {
      // Graceful fallback when API key is missing
      res.json({
        text: `💡 **[Offline mode]** No Gemini API key provided. I will answer as a local engineering solver:\n\nFor the **${modelContext?.equipmentName || 'Equipment'}** of rating **${modelContext?.powerRating || ''}**:\n* Selecting flux density of 1.6T prevents steel core saturation.\n* Insulating with Class H or Class F materials yields optimal temperature margins.\n* Primary current density of ~2.5 A/mm² balances copper loss and heat dissipation.\n\n*Please configure your GEMINI_API_KEY in the Secrets panel to activate full AI brainstorming.*`
      });
      return;
    }

    // Construct systemic prompt context instructing Gemini to act as a senior power electronics and electrical machines consultant
    const systemPrompt = `You are a team of expert elite electrical designers:
1. Senior Electrical Design Engineer (20+ years experience, specialty in transformers & standards)
2. Senior Electrical Machine Design Engineer (specialty in PMSM, AC, DC motors)
3. Power Electronics Design Engineer (specialty in buck, boost, flyback, VFDs, chargers)

You must explain engineering decisions using physical formulas, thermal margins, flux saturation risks, material considerations, and efficiency standards (e.g., IEEE C57, IEC 60076, NEMA MG1).
The user is currently designing a: ${modelContext?.equipmentName || 'custom system'}.
Current specifications input:
${JSON.stringify(modelContext?.specifications || {}, null, 2)}
Optimization goal: ${modelContext?.optimizationGoal || 'balanced'}.

Previous calculation results:
- Primary rating / Power: ${modelContext?.powerRating || 'N/A'}
- Efficiency estimate: ${modelContext?.calculatedEfficiency || 'N/A'}
- Copper/Switching losses: ${modelContext?.losses || 'N/A'}
- Weight: ${modelContext?.weight || 'N/A'}
- Selling/Production cost: ${modelContext?.cost || 'N/A'}

Provide precise, mathematical answers explaining core saturation limits, window utilization factor, wire sizing choice, MOSFET conduction loss ratios, or transient performance. Keep explanation clean, highly structural, and direct.`;

    // Construct chat contents or simple response
    const contents = [];
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Error communicating with AI services' });
  }
});

/**
 * Serves static frontend build in production / development
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // Serve index.html for any SPA route in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ ElectroDesign AI Server live on port ${PORT}`);
  });
}

startServer();
