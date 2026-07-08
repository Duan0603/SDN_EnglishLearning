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

// Accept a booking (restricted to mentors only)
bookingRouter.patch('/:id/accept', roleGuard(['MENTOR']), asyncHandler(BookingController.accept));

// Complete a booking (restricted to mentors only)
bookingRouter.patch('/:id/complete', roleGuard(['MENTOR']), asyncHandler(BookingController.complete));

// Add mentor review notes (restricted to mentors only)
bookingRouter.patch('/:id/notes', roleGuard(['MENTOR']), asyncHandler(BookingController.addNotes));

// Rate a booking (restricted to students only)
bookingRouter.patch('/:id/rate', roleGuard(['STUDENT']), asyncHandler(BookingController.rate));
