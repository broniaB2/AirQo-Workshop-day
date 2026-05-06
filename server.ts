/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // AirQo API Proxy Route
  app.get('/api/measurements', async (req, res) => {
    const AIRQO_API_KEY = process.env.VITE_AIRQO_API_KEY || process.env.AIRQO_API_KEY;
    const AIRQO_URL = 'https://api.airqo.net/api/v2/devices/measurements';

    if (!AIRQO_API_KEY || AIRQO_API_KEY === 'PASTE_YOUR_AIRQO_KEY_HERE') {
      return res.status(401).json({ 
        success: false, 
        message: 'AirQo API Key is missing in environment variables.' 
      });
    }

    try {
      const response = await fetch(AIRQO_URL, {
        headers: {
          'Authorization': `Bearer ${AIRQO_API_KEY}`,
        },
      });

      if (response.status === 401) {
        console.error('AirQo API: Unauthorized. Please check your API key.');
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Invalid or missing AirQo API Key.' 
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AirQo API error (${response.status}):`, errorText);
        return res.status(response.status).json({ 
          success: false, 
          message: `AirQo API responded with status: ${response.status}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Server-side fetch error:', error);
      res.status(500).json({ success: false, message: 'Failed to proxy request to AirQo' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
