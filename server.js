require('dotenv').config();
const http = require('http');
const app = require('./app');
const { runMigrations } = require('./db/migrate');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function start() {
  try {
    console.log(`Starting server in ${NODE_ENV} mode on port ${PORT}...`);

    // Run DB migrations
    await runMigrations();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`HTTP server listening on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();