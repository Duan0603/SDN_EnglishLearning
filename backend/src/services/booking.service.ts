import { prisma } from '../config/prisma.config';
import { acquireLock, releaseLock } from '../utils/redis-lock';

export class BookingService {
  /**
   * Concurrency-safe slot booking using Redis lock and Prisma transactions.
   */
  static async createBooking(studentId: string, availabilityId: string, notes?: string) {
    const lockKey = `booking:availability:${availabilityId}`;
    
    // Acquire Redis lock (10 seconds TTL)
    const lockAcquired = await acquireLock(lockKey, 10);
    if (!lockAcquired) {
      const conflictError: any = new Error('This timeslot is currently being processed by another student. Please try again in a moment.');
      conflictError.status = 409;
      throw conflictError;
    }

    try {
      // Find the availability slot
      const availability = await prisma.availability.findUnique({
        where: { id: availabilityId },
      });

      if (!availability) {
        throw new Error('Availability slot not found.');
      }

      if (availability.isBooked) {
        const bookedError: any = new Error('This timeslot has already been booked by someone else.');
        bookedError.status = 409;
        throw bookedError;
      }

      // Execute booking creation and slot update in a Prisma Transaction
      const bookingResult = await prisma.$transaction(async (tx) => {
        // Double-check availability booking status inside the transaction to avoid race conditions
        const latestAvailability = await tx.availability.findUnique({
          where: { id: availabilityId },
        });

        if (!latestAvailability || latestAvailability.isBooked) {
          const bookedError: any = new Error('This timeslot has already been booked.');
          bookedError.status = 409;
          throw bookedError;
        }

        // Create the booking
        const booking = await tx.booking.create({
          data: {
            studentId,
            mentorId: latestAvailability.mentorId,
            availabilityId,
            startTime: latestAvailability.startTime,
            endTime: latestAvailability.endTime,
            status: 'CONFIRMED', // Set to CONFIRMED directly upon success
            notes,
          },
          include: {
            mentor: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
              },
            },
          },
        });

        // Mark the availability slot as booked
        await tx.availability.update({
          where: { id: availabilityId },
          data: { isBooked: true },
        });

        return booking;
      });

      return bookingResult;
    } finally {
      // Always release lock
      await releaseLock(lockKey);
    }
  }

  /**
   * Get bookings for a student or mentor.
   */
  static async getBookings(userId: string, role: string) {
    if (role === 'MENTOR') {
      return await prisma.booking.findMany({
        where: { mentorId: userId },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          availability: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });
    } else {
      return await prisma.booking.findMany({
        where: { studentId: userId },
        include: {
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              bio: true,
              expertise: true,
            },
          },
          availability: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });
    }
  }

  /**
   * Update notes by mentor after the session.
   */
  static async updateMentorNotes(mentorId: string, bookingId: string, mentorNotes: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.mentorId !== mentorId) {
      throw new Error('Unauthorized to add notes to this booking.');
    }

    return await prisma.booking.update({
      where: { id: bookingId },
      data: { mentorNotes },
    });
  }

  /**
   * Cancel booking (and release slot).
   */
  static async cancelBooking(userId: string, role: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    // Verify ownership
    if (role === 'STUDENT' && booking.studentId !== userId) {
      throw new Error('Unauthorized.');
    }
    if (role === 'MENTOR' && booking.mentorId !== userId) {
      throw new Error('Unauthorized.');
    }

    return await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      // Release availability slot
      await tx.availability.update({
        where: { id: booking.availabilityId },
        data: { isBooked: false },
      });

      return updatedBooking;
    });
  }
}
