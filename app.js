const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();


const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware'); // central error handler

const app = express();

// Basic security
app.use(helmet());
app.use(cors());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API routes (e.g. /api/v1/users, /api/v1/transactions, etc.)
app.use('/api/v1', routes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Centralized error handler
app.use(errorMiddleware);

module.exports = app;