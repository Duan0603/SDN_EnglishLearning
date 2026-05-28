// Express Application factory
// Architecture: Separating app from server.ts allows easy testing with supertest
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes/index';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';
import { config } from './config/env.config';

export const createApp = (): Application => {
  const app = express();

  // Security middlewares
  app.use(helmet());
  app.use(cors({
    origin: config.nodeEnv === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000'] 
      : process.env.FRONTEND_URL,
    credentials: true,
  }));

  // Performance middlewares
  app.use(compression());

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

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
