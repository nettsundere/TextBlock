/**
 * Minimal static file server for the e2e test pages.
 * host_permissions cover http and https origins, so localhost pages are injectable.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PAGES = path.join(__dirname, 'pages');
const PORT = 8099;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

function start() {
  const server = http.createServer((req, res) => {
    const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const filePath = path.join(PAGES, path.normalize(urlPath));
    if (!filePath.startsWith(PAGES)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

module.exports = { start, PORT, BASE_URL: `http://localhost:${PORT}` };
