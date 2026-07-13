import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.config';
import { ApiError } from '../middlewares/error.middleware';

export class AdminBookingController {
  /**
   * GET /api/v1/admin/bookings
   * List all bookings in the system
   */
  static async getAllBookings(req: any, res: Response, next: NextFunction) {
    try {
      const { status, search } = req.query;

      const whereClause: any = {};
      if (status) {
        whereClause.status = status; // e.g. PENDING, CONFIRMED, COMPLETED, CANCELLED
      }

      if (search) {
        const searchQuery = search as string;
        whereClause.OR = [
          { student: { fullName: { contains: searchQuery, mode: 'insensitive' } } },
          { student: { email: { contains: searchQuery, mode: 'insensitive' } } },
          { mentor: { fullName: { contains: searchQuery, mode: 'insensitive' } } },
          { mentor: { email: { contains: searchQuery, mode: 'insensitive' } } },
          { id: { contains: searchQuery } },
        ];
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          student: {
            select: { id: true, fullName: true, email: true, phone: true, avatar: true }
          },
          mentor: {
            select: { id: true, fullName: true, email: true, phone: true, avatar: true }
          },
          availability: true,
        },
        orderBy: { startTime: 'desc' },
      });

      return res.status(200).json({
        success: true,
        message: 'Get bookings successfully',
        data: bookings
      });
    } catch (err: any) {
      next(new ApiError(err.message || 'Failed to retrieve bookings', 400));
    }
  }

  /**
   * PATCH /api/v1/admin/bookings/:id/confirm
   * Force confirm a booking as an admin
   */
  static async confirmBooking(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new ApiError('Booking not found', 404);
      }

      if (booking.status !== 'PENDING') {
        throw new ApiError('Only pending bookings can be confirmed', 400);
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      });

      return res.status(200).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: updated
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/bookings/:id/cancel
   * Force cancel a booking as an admin
   */
  static async cancelBooking(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { cancelReason } = req.body;

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new ApiError('Booking not found', 404);
      }

      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
        throw new ApiError('Cannot cancel completed or already cancelled booking', 400);
      }

      const updated = await prisma.$transaction(async (tx) => {
        const u = await tx.booking.update({
          where: { id },
          data: { status: 'CANCELLED', cancelReason: cancelReason || 'Cancelled by Admin' },
        });

        // Release slot
        await tx.availability.update({
          where: { id: booking.availabilityId },
          data: { isBooked: false },
        });

        return u;
      });

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: updated
      });
    } catch (err: any) {
      next(err);
    }
  }
}
