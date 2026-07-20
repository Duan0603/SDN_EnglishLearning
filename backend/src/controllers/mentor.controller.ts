import { Request, Response, NextFunction } from 'express';
import { MentorService } from '../services/mentor.service';
import { ApiError } from '../middlewares/error.middleware';
import { prisma } from '../config/prisma.config';

export class MentorController {
  /**
   * GET /api/v1/mentors
   * List all active mentors
   */
  static async getAllActiveMentors(req: Request, res: Response, next: NextFunction) {
    try {
      const mentors = await MentorService.getAllActiveMentorsWithRatings();
      res.status(200).json({
        success: true,
        data: mentors,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to fetch mentors.', 400));
    }
  }

  /**
   * POST /api/v1/mentors/availabilities
   */
  static async createSlot(req: any, res: Response, next: NextFunction) {
    try {
      const mentorId = req.currentUser?.id || req.user?.userId;
      if (!mentorId) {
        return next(new ApiError('Unauthorized', 401));
      }

      const { startTime, endTime, meetingLink } = req.body;
      if (!startTime || !endTime) {
        return next(new ApiError('startTime and endTime are required.', 400));
      }

      const slot = await MentorService.createAvailability(
        mentorId,
        new Date(startTime),
        new Date(endTime),
        meetingLink
      );

      res.status(201).json({
        success: true,
        message: 'Availability slot created successfully.',
        data: slot,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to create availability.', 400));
    }
  }

  /**
   * GET /api/v1/mentors/availabilities
   * List slots of current logged-in mentor
   */
  static async getMySlots(req: any, res: Response, next: NextFunction) {
    try {
      const mentorId = req.currentUser?.id || req.user?.userId;
      if (!mentorId) {
        return next(new ApiError('Unauthorized', 401));
      }

      const slots = await MentorService.getAvailabilities(mentorId, false, false);
      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to fetch availabilities.', 400));
    }
  }

  /**
   * GET /api/v1/mentors/:id/availabilities
   * List unbooked slots of a specific mentor (Public endpoint)
   */
  static async getMentorPublicSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const slots = await MentorService.getAvailabilities(id, false, true);
      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to fetch mentor availabilities.', 400));
    }
  }

  /**
   * DELETE /api/v1/mentors/availabilities/:id
   */
  static async deleteSlot(req: any, res: Response, next: NextFunction) {
    try {
      const mentorId = req.currentUser?.id || req.user?.userId;
      if (!mentorId) {
        return next(new ApiError('Unauthorized', 401));
      }

      const { id } = req.params;
      await MentorService.deleteAvailability(mentorId, id);

      res.status(200).json({
        success: true,
        message: 'Availability slot deleted successfully.',
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to delete availability.', 400));
    }
  }

  /**
   * GET /api/v1/mentors/:id/reviews
   * Get public reviews and ratings for a mentor
   */
  static async getMentorReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await MentorService.getMentorReviews(id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to fetch mentor reviews.', 400));
    }
  }
}
