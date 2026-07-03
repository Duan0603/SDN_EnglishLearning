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
import { examRouter } from './exam.routes';
import { adminRouter } from './admin/index.js';
import { mentorRouter } from './mentor.routes';
import { bookingRouter } from './booking.routes';
import { userRouter } from './user/index';

apiRouter.use('/api/v1/access', accessRouter);
apiRouter.use('/api/v1/auth', accessRouter);
apiRouter.use('/api/v1/exams', examRouter);
apiRouter.use('/api/v1/admin', adminRouter);
apiRouter.use('/api/v1/mentors', mentorRouter);
apiRouter.use('/api/v1/bookings', bookingRouter);
apiRouter.use('/api/v1/users', userRouter);
