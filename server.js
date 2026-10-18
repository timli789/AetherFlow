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

  // Route: /api/nouns (Proxy to Supabase with full Range pagination)
  if (cleanUrl === '/api/nouns') {
    try {
      const headers = {
        'apikey': 'sb_publishable_puw8xu-OwPWKAtVgaWpiTg_CjOO93lF',
        'Authorization': 'Bearer sb_publishable_puw8xu-OwPWKAtVgaWpiTg_CjOO93lF'
      };

      const initialResponse = await fetch('https://diryaljjfcucuvzyelvk.supabase.co/rest/v1/nouns?select=word', {
        headers: { ...headers, 'Range': '0-999', 'Prefer': 'count=exact' }
      });

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
            fetch('https://diryaljjfcucuvzyelvk.supabase.co/rest/v1/nouns?select=word', {
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
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600, public',
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
