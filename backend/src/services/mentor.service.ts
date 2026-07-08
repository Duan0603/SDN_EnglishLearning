import { prisma } from '../config/prisma.config';

export class MentorService {
  /**
   * Create an availability slot for a mentor.
   */
  static async createAvailability(mentorId: string, startTime: Date, endTime: Date, meetingLink?: string) {
    if (startTime <= new Date()) {
      throw new Error('Start time must be in the future.');
    }
    if (endTime <= startTime) {
      throw new Error('End time must be after start time.');
    }

    // Check for overlap of timeslots for this mentor
    const overlap = await prisma.availability.findFirst({
      where: {
        mentorId,
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (overlap) {
      throw new Error('This timeslot overlaps with an existing availability slot.');
    }

    return await prisma.availability.create({
      data: {
        mentorId,
        startTime,
        endTime,
        meetingLink,
      },
    });
  }

  static async getAvailabilities(mentorId: string, unbookedOnly: boolean = false, isStudentView: boolean = false) {
    const now = new Date();
    const whereClause: any = { mentorId };
    
    if (unbookedOnly) {
      whereClause.isBooked = false;
    }

    if (isStudentView) {
      // Students: only see future slots
      whereClause.startTime = {
        gte: now,
      };
    } else {
      // Mentors: show future slots OR past slots that are booked (hide unbooked past slots)
      whereClause.OR = [
        {
          startTime: {
            gte: now,
          },
        },
        {
          startTime: {
            lt: now,
          },
          isBooked: true,
        },
      ];
    }

    return await prisma.availability.findMany({
      where: whereClause,
      include: {
        booking: {
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
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Delete an availability slot.
   */
  static async deleteAvailability(mentorId: string, slotId: string) {
    const slot = await prisma.availability.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error('Availability slot not found.');
    }

    if (slot.mentorId !== mentorId) {
      throw new Error('Unauthorized to delete this slot.');
    }

    if (slot.isBooked) {
      throw new Error('Cannot delete a timeslot that has already been booked.');
    }

    return await prisma.availability.delete({
      where: { id: slotId },
    });
  }
}
