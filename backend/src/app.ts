// Express Application factory
// Architecture: Separating app from server.ts allows easy testing with supertest
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { apiRouter } from './routes/index';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';
import { config } from './config/env.config';

export const createApp = (): Application => {
  const app = express();

  // Serve static images folder
  app.use('/images', express.static(path.join(__dirname, '../public/images')));
  app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

  // Security middlewares
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  const ALLOWED_ORIGINS = [
    // Local development
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:8081',
    'http://10.0.2.2:8081',
    // Deployed frontend(s) — add your Render URL here
    'https://sdn-englishlearning-frontend.onrender.com',
    'https://sdn-englishlearning-qnnw.onrender.com',
    // Custom FRONTEND_URL from env (optional override)
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
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
