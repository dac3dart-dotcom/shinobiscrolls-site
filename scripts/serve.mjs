import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.DENSETSU_PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

const server = createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const filePath = resolve(join(root, normalize(relativePath)));
    if (!filePath.startsWith(root)) throw new Error('Not found');
    let data = await readFile(filePath);
    if (relativePath === 'index.html') {
      const html = data.toString('utf8');
      data = Buffer.from(html.replace('<script type="module" src="app.js"></script>', '<script>window.__DENSETSU_DEV__=true;</script><script type="module" src="app.js"></script>'));
    }
    response.writeHead(200, { 'Content-Type': mime[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    response.end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  const addresses = Object.values(networkInterfaces()).flat().filter(address => address && address.family === 'IPv4' && !address.internal).map(address => address.address);
  console.log(`Local:   http://localhost:${port}/`);
  console.log(`Network: ${addresses.length ? addresses.map(address => `http://${address}:${port}/`).join(', ') : 'No non-loopback IPv4 address detected'}`);
  console.log('Open the Network URL on a phone/tablet connected to the same Wi-Fi.');
});
