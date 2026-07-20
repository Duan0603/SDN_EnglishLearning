import { Router } from 'express';
import { MentorController } from '../controllers/mentor.controller';
import { authentication } from '../auth/authUtils.js';
import { roleGuard } from '../middlewares/role.middleware';
import { asyncHandler } from '../auth/checkAuth.js';

export const mentorRouter = Router();

// Publicly visible: Student can view active mentors, their reviews, and their slots
mentorRouter.get('/', authentication, asyncHandler(MentorController.getAllActiveMentors));
mentorRouter.get('/:id/availabilities', authentication, asyncHandler(MentorController.getMentorPublicSlots));
mentorRouter.get('/:id/reviews', authentication, asyncHandler(MentorController.getMentorReviews));

// Availability CRUD endpoints - restricted to MENTORS only
mentorRouter.use(authentication);
mentorRouter.use(roleGuard(['MENTOR']));

mentorRouter.post('/availabilities', asyncHandler(MentorController.createSlot));
mentorRouter.get('/availabilities', asyncHandler(MentorController.getMySlots));
mentorRouter.delete('/availabilities/:id', asyncHandler(MentorController.deleteSlot));
