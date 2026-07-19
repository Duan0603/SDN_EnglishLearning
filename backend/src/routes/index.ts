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
import { adminRouter } from './admin/index';
import { mentorRouter } from './mentor.routes';
import { bookingRouter } from './booking.routes';
import { userRouter } from './user/index';
import { uploadRouter } from './upload.routes';

apiRouter.use('/api/v1/access', accessRouter);
apiRouter.use('/api/v1/auth', accessRouter);
apiRouter.use('/api/v1/exams', examRouter);
apiRouter.use('/api/v1/admin', adminRouter);
apiRouter.use('/api/v1/mentors', mentorRouter);
apiRouter.use('/api/v1/bookings', bookingRouter);
apiRouter.use('/api/v1/users', userRouter);
apiRouter.use('/api/v1/upload', uploadRouter);

// ─── Alias routes without /api/v1 prefix ────────────────────────────────────
// Allows frontend to work even if VITE_API_URL is set without /api/v1
apiRouter.use('/auth', accessRouter);
apiRouter.use('/access', accessRouter);
apiRouter.use('/exams', examRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/mentors', mentorRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/upload', uploadRouter);

