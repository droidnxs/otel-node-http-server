import * as http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Route handling
  if (req.method === 'GET' && req.url === '/') {
    handleHome(req, res);
  } else if (req.method === 'GET' && req.url === '/health') {
    handleHealth(req, res);
  } else if (req.method === 'GET' && req.url?.startsWith('/hello')) {
    handleHello(req, res);
  } else if (req.method === 'POST' && req.url === '/echo') {
    handleEcho(req, res);
  } else {
    handleNotFound(req, res);
  }
});

function handleHome(req: http.IncomingMessage, res: http.ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>Simple HTTP Server</title></head>
      <body>
        <h1>Welcome to Simple HTTP Server with OpenTelemetry!</h1>
        <p>Available endpoints:</p>
        <ul>
          <li><a href="/">GET /</a> - This page</li>
          <li><a href="/health">GET /health</a> - Health check</li>
          <li><a href="/hello?name=World">GET /hello?name=YourName</a> - Greeting</li>
          <li>POST /echo - Echo back JSON payload</li>
        </ul>
      </body>
    </html>
  `);
}

function handleHealth(req: http.IncomingMessage, res: http.ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  }));
}

function handleHello(req: http.IncomingMessage, res: http.ServerResponse): void {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const name = url.searchParams.get('name') || 'World';
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString()
  }));
}

function handleEcho(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        echo: data,
        receivedAt: new Date().toISOString()
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Invalid JSON',
        message: errorMessage
      }));
    }
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Request error' }));
  });
}

function handleNotFound(req: http.IncomingMessage, res: http.ServerResponse): void {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    error: 'Not found',
    path: req.url
  }));
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Simple HTTP Server started on port ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
});

// Handle graceful shutdown
const shutdown = (): void => {
  console.log('\n\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

