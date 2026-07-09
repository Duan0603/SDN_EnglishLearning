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

  /**
   * GET /api/v1/bookings/:id/messages
   */
  static async getChatMessages(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser?.id || req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return next(new ApiError('Unauthorized', 401));
      }

      const messages = await BookingService.getChatMessages(userId, id);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      if (error.status === 403) {
        return res.status(403).json({
          success: false,
          message: error.message || 'Forbidden.',
        });
      }
      next(new ApiError(error.message || 'Failed to fetch chat history.', 400));
    }
  }

  /**
   * POST /api/v1/bookings/:id/upload-file
   */
  static async uploadFile(req: any, res: Response, next: NextFunction) {
    try {
      const senderId = req.currentUser?.id || req.user?.userId;
      const { id } = req.params;
      const { file, fileName, fileSize } = req.body;

      if (!senderId) {
        return next(new ApiError('Unauthorized', 401));
      }

      if (!file || !fileName) {
        return next(new ApiError('Missing file or fileName in request body.', 400));
      }

      const message = await BookingService.saveFileMessage(id, senderId, file, fileName, fileSize || 0);

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'File upload failed.', 400));
    }
  }
}
