import dotenv from 'dotenv';
import app from './app';
import { logger } from '@utils/logger';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  logger.info(`Server started`, {
    port: PORT,
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

export default server;
