// Main API Router — aggregates all versioned routes
// Architecture: REST endpoints follow kebab-case, prefixed with /api/v1
import { Router } from 'express';
import { healthRouter } from './health.routes';

export const apiRouter = Router();

// Health check (no version prefix — accessible at root level)
apiRouter.use('/', healthRouter);

// API v1 routes (populated in later epics)
// apiRouter.use('/api/v1/auth', authRouter);       // Epic 1, Story 1.2
// apiRouter.use('/api/v1/exams', examRouter);      // Epic 2
// apiRouter.use('/api/v1/speaking', speakingRouter); // Epic 3
// apiRouter.use('/api/v1/bookings', bookingRouter); // Epic 4
// apiRouter.use('/api/v1/users', userRouter);      // Epic 1, Story 1.2

import { accessRouter } from './access/index';
apiRouter.use('/api/v1/access', accessRouter);
apiRouter.use('/api/v1/auth', accessRouter);
