const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer(async (req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  const cleanUrl = req.url.split('?')[0];

  // Route: /api/nouns (Proxy to Supabase with full Range pagination & reviewed tracking)
  if (cleanUrl === '/api/nouns') {
    const SUPABASE_URL = 'https://diryaljjfcucuvzyelvk.supabase.co/rest/v1/nouns';
    const headers = {
      'apikey': 'sb_publishable_puw8xu-OwPWKAtVgaWpiTg_CjOO93lF',
      'Authorization': 'Bearer sb_publishable_puw8xu-OwPWKAtVgaWpiTg_CjOO93lF'
    };

    if (req.method === 'POST' || req.method === 'PATCH') {
      let rawBody = '';
      req.on('data', chunk => { rawBody += chunk.toString(); });
      req.on('end', async () => {
        try {
          const parsed = rawBody ? JSON.parse(rawBody) : {};
          const rawWords = Array.isArray(parsed.words) ? parsed.words : (parsed.word ? [parsed.word] : []);
          const cleaned = rawWords.map(w => String(w || '').trim()).filter(Boolean);

          if (cleaned.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No words provided to mark as reviewed.' }));
            return;
          }

          const normalizedVals = [...new Set(cleaned.map(w => w.toLowerCase()))]
            .map(w => `"${w.replace(/"/g, '\\"')}"`)
            .join(',');
          const exactVals = [...new Set([...cleaned, ...cleaned.map(w => w.toLowerCase())])]
            .map(w => `"${w.replace(/"/g, '\\"')}"`)
            .join(',');

          const filterQuery = `or=(normalized.in.(${normalizedVals}),word.in.(${exactVals}))`;
          const patchRes = await fetch(`${SUPABASE_URL}?${filterQuery}`, {
            method: 'PATCH',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ reviewed: true })
          });

          if (!patchRes.ok) {
            const errText = await patchRes.text();
            throw new Error(`Supabase PATCH failed (${patchRes.status}): ${errText}`);
          }

          const updated = await patchRes.json();
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ updatedCount: Array.isArray(updated) ? updated.length : 0 }));
        } catch (err) {
          console.error("Local POST /api/nouns handler error:", err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    try {
      let queryUrl = `${SUPABASE_URL}?select=word,reviewed&or=(reviewed.is.null,reviewed.eq.false)`;
      let initialResponse = await fetch(queryUrl, {
        headers: { ...headers, 'Range': '0-999', 'Prefer': 'count=exact' }
      });

      if (!initialResponse.ok && initialResponse.status === 400) {
        queryUrl = `${SUPABASE_URL}?select=word`;
        initialResponse = await fetch(queryUrl, {
          headers: { ...headers, 'Range': '0-999', 'Prefer': 'count=exact' }
        });
      }

      if (!initialResponse.ok) {
        throw new Error(`Supabase REST query responded with status ${initialResponse.status}`);
      }

      const firstBatch = await initialResponse.json();
      const contentRange = initialResponse.headers.get('content-range');
      let totalCount = 0;
      if (contentRange && contentRange.includes('/')) {
        totalCount = parseInt(contentRange.split('/')[1], 10);
      }

      let allWords = [...firstBatch];

      if (totalCount > 1000) {
        const remainingPromises = [];
        for (let offset = 1000; offset < totalCount; offset += 1000) {
          const end = Math.min(offset + 999, totalCount - 1);
          remainingPromises.push(
            fetch(queryUrl, {
              headers: { ...headers, 'Range': `${offset}-${end}` }
            }).then(r => r.json())
          );
        }
        const remainingBatches = await Promise.all(remainingPromises);
        for (const batch of remainingBatches) {
          if (Array.isArray(batch)) {
            allWords.push(...batch);
          }
        }
      }

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(allWords));
      return;
    } catch (err) {
      console.error("Local /api/nouns handler error:", err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Handle static files
  let filePath = '.' + cleanUrl;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 8081;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Fast Node.js server running on http://0.0.0.0:${PORT}/`);
});
