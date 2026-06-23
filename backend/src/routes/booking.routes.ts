import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authentication } from '../auth/authUtils.js';
import { roleGuard } from '../middlewares/role.middleware';
import { asyncHandler } from '../auth/checkAuth.js';

export const bookingRouter = Router();

// All booking routes require a valid authenticated session
bookingRouter.use(authentication);

// List my bookings (students or mentors)
bookingRouter.get('/', asyncHandler(BookingController.getMyBookings));

// Book a new slot (restricted to students only, as mentors cannot book slots)
bookingRouter.post('/', roleGuard(['STUDENT']), asyncHandler(BookingController.bookSlot));

// Cancel a booking (accessible to students/mentors)
bookingRouter.patch('/:id/cancel', asyncHandler(BookingController.cancel));

// Add mentor review notes (restricted to mentors only)
bookingRouter.patch('/:id/notes', roleGuard(['MENTOR']), asyncHandler(BookingController.addNotes));
