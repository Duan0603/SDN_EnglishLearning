import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { ApiError } from '../middlewares/error.middleware';

export class BookingController {
  /**
   * POST /api/v1/bookings
   */
  static async bookSlot(req: any, res: Response, next: NextFunction) {
    try {
      const studentId = req.currentUser?.id || req.user?.userId;
      const { availabilityId, notes } = req.body;

      if (!studentId) {
        return next(new ApiError('Unauthorized', 401));
      }
      if (!availabilityId) {
        return next(new ApiError('availabilityId is required.', 400));
      }

      const booking = await BookingService.createBooking(studentId, availabilityId, notes);

      res.status(201).json({
        success: true,
        message: 'Mentor session booked successfully.',
        data: booking,
      });
    } catch (error: any) {
      if (error.status === 409) {
        return res.status(409).json({
          success: false,
          message: error.message || 'Slot already booked.',
        });
      }
      next(new ApiError(error.message || 'Booking failed.', 400));
    }
  }

  /**
   * GET /api/v1/bookings
   */
  static async getMyBookings(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser?.id || req.user?.userId;
      const role = req.currentUser?.role || req.user?.role;

      if (!userId || !role) {
        return next(new ApiError('Unauthorized', 401));
      }

      const bookings = await BookingService.getBookings(userId, role);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to fetch bookings.', 400));
    }
  }

  /**
   * PATCH /api/v1/bookings/:id/notes
   */
  static async addNotes(req: any, res: Response, next: NextFunction) {
    try {
      const mentorId = req.currentUser?.id || req.user?.userId;
      const { id } = req.params;
      const { mentorNotes } = req.body;

      if (!mentorId) {
        return next(new ApiError('Unauthorized', 401));
      }
      if (!mentorNotes) {
        return next(new ApiError('mentorNotes is required.', 400));
      }

      const validId = (typeof id === 'string' && id.length === 24) ? id : null;
      if (!validId) return next(new ApiError('Invalid booking ID format.', 400));
      
      const booking = await BookingService.updateMentorNotes(mentorId, id, mentorNotes);

      res.status(200).json({
        success: true,
        message: 'Mentor notes saved successfully.',
        data: booking,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to save notes.', 400));
    }
  }

  /**
   * PATCH /api/v1/bookings/:id/cancel
   */
  static async cancel(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser?.id || req.user?.userId;
      const role = req.currentUser?.role || req.user?.role;
      const { id } = req.params;

      if (!userId || !role) {
        return next(new ApiError('Unauthorized', 401));
      }

      const { cancelReason } = req.body;
      const validId = (typeof id === 'string' && id.length === 24) ? id : null;
      if (!validId) return next(new ApiError('Invalid booking ID format.', 400));
      
      const booking = await BookingService.cancelBooking(userId, role, id, cancelReason);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully.',
        data: booking,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Cancellation failed.', 400));
    }
  }

  /**
   * PATCH /api/v1/bookings/:id/accept
   */
  static async accept(req: any, res: Response, next: NextFunction) {
    try {
      const mentorId = req.currentUser?.id || req.user?.userId;
      const { id } = req.params;

      if (!mentorId) {
        return next(new ApiError('Unauthorized', 401));
      }

      const validId = (typeof id === 'string' && id.length === 24) ? id : null;
      if (!validId) return next(new ApiError('Invalid booking ID format.', 400));
      
      const booking = await BookingService.acceptBooking(mentorId, id);

      res.status(200).json({
        success: true,
        message: 'Booking accepted successfully.',
        data: booking,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Acceptance failed.', 400));
    }
  }

  /**
   * PATCH /api/v1/bookings/:id/rate
   */
  static async rate(req: any, res: Response, next: NextFunction) {
    try {
      const studentId = req.currentUser?.id || req.user?.userId;
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!studentId) {
        return next(new ApiError('Unauthorized', 401));
      }
      if (rating === undefined || rating === null) {
        return next(new ApiError('rating is required.', 400));
      }

      const validId = (typeof id === 'string' && id.length === 24) ? id : null;
      if (!validId) return next(new ApiError('Invalid booking ID format.', 400));
      
      const booking = await BookingService.rateBooking(studentId, id, Number(rating), comment || '');

      res.status(200).json({
        success: true,
        message: 'Booking rated successfully.',
        data: booking,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to submit rating.', 400));
    }
  }

  /**
   * PATCH /api/v1/bookings/:id/complete
   */
  static async complete(req: any, res: Response, next: NextFunction) {
    try {
      const mentorId = req.currentUser?.id || req.user?.userId;
      const { id } = req.params;

      if (!mentorId) {
        return next(new ApiError('Unauthorized', 401));
      }

      const validId = (typeof id === 'string' && id.length === 24) ? id : null;
      if (!validId) return next(new ApiError('Invalid booking ID format.', 400));
      
      const booking = await BookingService.completeBooking(mentorId, id);

      res.status(200).json({
        success: true,
        message: 'Booking completed successfully.',
        data: booking,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Completion failed.', 400));
    }
  }
}
