// Express Application factory
// Architecture: Separating app from server.ts allows easy testing with supertest
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { apiRouter } from './routes/index';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';
import { config } from './config/env.config';

export const createApp = (): Application => {
  const app = express();

  // Security middlewares
  app.use(helmet());
  app.use(cors({
    origin: config.nodeEnv === 'development' ? '*' : (process.env.FRONTEND_URL || ''),
    credentials: true,
  }));

  // Performance middlewares
  app.use(compression());

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging (only in non-test environments)
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Routes
  app.use('/', apiRouter);

  // Error handling — MUST be registered LAST
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
