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

    const availabilities = await prisma.availability.findMany({
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

    if (isStudentView) {
      return availabilities;
    }

    return await Promise.all(
      availabilities.map(async (a) => {
        if (!a.booking) return a;

        const lastReadAt = a.booking.mentorLastReadAt;
        let hasUnreadMessages = false;
        if (lastReadAt) {
          const count = await prisma.message.count({
            where: {
              bookingId: a.booking.id,
              senderId: { not: mentorId },
              createdAt: { gt: lastReadAt },
            },
          });
          hasUnreadMessages = count > 0;
        } else {
          const count = await prisma.message.count({
            where: {
              bookingId: a.booking.id,
              senderId: { not: mentorId },
            },
          });
          hasUnreadMessages = count > 0;
        }

        return {
          ...a,
          booking: {
            ...a.booking,
            hasUnreadMessages,
          },
        };
      })
    );
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

  /**
   * Get list of active mentors with aggregated ratings and review counts.
   */
  static async getAllActiveMentorsWithRatings() {
    const mentors = await prisma.user.findMany({
      where: {
        role: 'MENTOR',
        status: 'active',
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        bio: true,
        expertise: true,
      },
    });

    if (mentors.length === 0) return [];

    const mentorIds = mentors.map((m) => m.id);

    const ratingStats = await prisma.booking.groupBy({
      by: ['mentorId'],
      where: {
        mentorId: { in: mentorIds },
        rating: { not: null },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const statsMap = new Map<string, { averageRating: number; totalReviews: number }>(
      ratingStats.map((stat) => [
        stat.mentorId,
        {
          averageRating: stat._avg.rating ? Math.round(stat._avg.rating * 10) / 10 : 0,
          totalReviews: stat._count.rating || 0,
        },
      ])
    );

    const defaultExpertise = 'IELTS Speaking, Writing Task 2, Reading & Listening Strategies';
    const defaultBio = 'Giảng viên IELTS giàu kinh nghiệm, chuyên đồng hành cùng học viên phát triển toàn diện kỹ năng tiếng Anh và đạt mục tiêu band mong muốn.';

    return mentors.map((mentor) => {
      const stat = statsMap.get(mentor.id);
      return {
        ...mentor,
        expertise: mentor.expertise && mentor.expertise.trim() !== '' ? mentor.expertise : defaultExpertise,
        bio: mentor.bio && mentor.bio.trim() !== '' ? mentor.bio : defaultBio,
        averageRating: stat ? stat.averageRating : 0,
        totalReviews: stat ? stat.totalReviews : 0,
      };
    });
  }

  /**
   * Get detailed reviews and rating distribution for a specific mentor.
   */
  static async getMentorReviews(mentorId: string) {
    const mentor = await prisma.user.findFirst({
      where: {
        id: mentorId,
        role: 'MENTOR',
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        bio: true,
        expertise: true,
      },
    });

    if (!mentor) {
      throw new Error('Mentor không tồn tại.');
    }

    const defaultExpertise = 'IELTS Speaking, Writing Task 2, Reading & Listening Strategies';
    const defaultBio = 'Giảng viên IELTS giàu kinh nghiệm, chuyên đồng hành cùng học viên phát triển toàn diện kỹ năng tiếng Anh và đạt mục tiêu band mong muốn.';

    const mentorProfile = {
      ...mentor,
      expertise: mentor.expertise && mentor.expertise.trim() !== '' ? mentor.expertise : defaultExpertise,
      bio: mentor.bio && mentor.bio.trim() !== '' ? mentor.bio : defaultBio,
    };

    const reviews = await prisma.booking.findMany({
      where: {
        mentorId,
        rating: { not: null },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalReviews = reviews.length;
    const sumRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = totalReviews > 0 ? Math.round((sumRating / totalReviews) * 10) / 10 : 0;

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating && r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      }
    });

    return {
      mentor: {
        ...mentorProfile,
        averageRating,
        totalReviews,
      },
      averageRating,
      totalReviews,
      distribution,
      reviews,
    };
  }
}

