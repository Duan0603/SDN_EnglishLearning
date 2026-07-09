import { prisma } from '../config/prisma.config';
import { acquireLock, releaseLock } from '../utils/redis-lock';
import { emitSlotUpdate, emitBookingUpdate, emitChatMessage } from '../sockets';

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
            status: 'PENDING', // Set to PENDING initially (requires mentor acceptance)
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

      // Emit real-time update that slot is now booked (unavailable)
      emitSlotUpdate(availabilityId, bookingResult.mentorId, true);

      // Emit real-time booking update
      emitBookingUpdate(studentId, bookingResult.mentorId, bookingResult.id, 'PENDING');

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
    const list = await prisma.booking.findMany({
      where: role === 'MENTOR' ? { mentorId: userId } : { studentId: userId },
      include: role === 'MENTOR'
        ? {
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
          }
        : {
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

    return await Promise.all(
      list.map(async (b) => {
        const isStudent = b.studentId === userId;
        const lastReadAt = isStudent ? b.studentLastReadAt : b.mentorLastReadAt;
        
        let hasUnreadMessages = false;
        if (lastReadAt) {
          const count = await prisma.message.count({
            where: {
              bookingId: b.id,
              senderId: { not: userId },
              createdAt: { gt: lastReadAt },
            },
          });
          hasUnreadMessages = count > 0;
        } else {
          const count = await prisma.message.count({
            where: {
              bookingId: b.id,
              senderId: { not: userId },
            },
          });
          hasUnreadMessages = count > 0;
        }

        return {
          ...b,
          hasUnreadMessages,
        };
      })
    );
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

    if (booking.status !== 'COMPLETED') {
      throw new Error('Bạn chỉ có thể viết nhận xét sau khi đã HOÀN THÀNH (COMPLETED) buổi học.');
    }

    return await prisma.booking.update({
      where: { id: bookingId },
      data: { mentorNotes },
    });
  }

  /**
   * Rate and comment booking by student after session.
   */
  static async rateBooking(studentId: string, bookingId: string, rating: number, comment: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Lịch học không tồn tại.');
    }

    if (booking.studentId !== studentId) {
      throw new Error('Bạn không có quyền đánh giá lịch học này.');
    }

    if (booking.status !== 'COMPLETED') {
      throw new Error('Bạn chỉ có thể đánh giá lịch học sau khi gia sư đã bấm HOÀN THÀNH (COMPLETED) buổi học.');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Điểm đánh giá phải từ 1 đến 5 sao.');
    }

    return await prisma.booking.update({
      where: { id: bookingId },
      data: {
        rating,
        comment,
      },
    });
  }

  /**
   * Cancel booking (and release slot).
   */
  static async cancelBooking(userId: string, role: string, bookingId: string, cancelReason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    // Verify ownership and cancellation permissions
    if (role === 'STUDENT') {
      if (booking.studentId !== userId) {
        throw new Error('Unauthorized.');
      }
      if (booking.status === 'CONFIRMED') {
        throw new Error('Bạn không thể hủy lịch học đã được phê duyệt. Chỉ gia sư mới có quyền hủy.');
      }
    }
    if (role === 'MENTOR' && booking.mentorId !== userId) {
      throw new Error('Unauthorized.');
    }

    const cancelResult = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { 
          status: 'CANCELLED',
          cancelReason: cancelReason || null
        } as any,
      });

      // Release availability slot
      await tx.availability.update({
        where: { id: booking.availabilityId },
        data: { isBooked: false },
      });

      return updatedBooking;
    });

    // Emit real-time update that slot is now released (available)
    emitSlotUpdate(booking.availabilityId, booking.mentorId, false);

    // Emit real-time booking update
    emitBookingUpdate(booking.studentId, booking.mentorId, booking.id, 'CANCELLED');

    return cancelResult;
  }

  /**
   * Accept booking (only accessible to the assigned mentor).
   */
  static async acceptBooking(mentorId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.mentorId !== mentorId) {
      throw new Error('Unauthorized.');
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Only pending bookings can be accepted.');
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    emitBookingUpdate(updated.studentId, updated.mentorId, updated.id, 'CONFIRMED');

    return updated;
  }

  /**
   * Complete booking (only accessible to the assigned mentor).
   */
  static async completeBooking(mentorId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Lịch học không tồn tại.');
    }

    if (booking.mentorId !== mentorId) {
      throw new Error('Bạn không có quyền hoàn thành lịch học này.');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Chỉ lịch học ở trạng thái ĐÃ PHÊ DUYỆT mới có thể hoàn thành.');
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
    });

    emitBookingUpdate(updated.studentId, updated.mentorId, updated.id, 'COMPLETED');

    return updated;
  }

  /**
   * Save a new chat message to DB.
   */
  static async saveMessage(bookingId: string, senderId: string, content: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Lịch học không tồn tại.');
    }

    if (booking.studentId !== senderId && booking.mentorId !== senderId) {
      throw new Error('Bạn không tham gia lịch học này.');
    }

    const isStudent = booking.studentId === senderId;

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          bookingId,
          senderId,
          content: content.trim(),
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: isStudent ? { studentLastReadAt: new Date() } : { mentorLastReadAt: new Date() },
      })
    ]);

    // Emit a socket update so that bells and stats reload real-time!
    emitBookingUpdate(booking.studentId, booking.mentorId, booking.id, booking.status);

    return message;
  }

  /**
   * Load chat history for a booking room.
   */
  static async getChatMessages(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Lịch học không tồn tại.');
    }

    if (booking.studentId !== userId && booking.mentorId !== userId) {
      const authError: any = new Error('Bạn không có quyền xem tin nhắn của lịch học này.');
      authError.status = 403;
      throw authError;
    }

    const isStudent = booking.studentId === userId;

    await prisma.booking.update({
      where: { id: bookingId },
      data: isStudent ? { studentLastReadAt: new Date() } : { mentorLastReadAt: new Date() },
    });

    // Also trigger booking update event to clear the bell badge for the reader!
    emitBookingUpdate(booking.studentId, booking.mentorId, booking.id, booking.status);

    return await prisma.message.findMany({
      where: { bookingId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Save a new file attachment message.
   */
  static async saveFileMessage(
    bookingId: string,
    senderId: string,
    fileBase64: string,
    fileName: string,
    fileSize: number
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Lịch học không tồn tại.');
    }

    if (booking.studentId !== senderId && booking.mentorId !== senderId) {
      throw new Error('Bạn không tham gia lịch học này.');
    }

    // Reload dotenv dynamically to ensure new env variables are read
    const dotenv = await import('dotenv');
    dotenv.config();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Chưa cấu hình thông tin Cloudinary trên server.');
    }

    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const publicId = `chat_file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${fileExtension}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    let uploadRes;
    try {
      const axios = (await import('axios')).default;
      uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          file: fileBase64,
          api_key: apiKey,
          timestamp: timestamp,
          signature: signature,
          public_id: publicId,
        }
      );
    } catch (err: any) {
      console.error('Cloudinary Upload Error Details:', err.response?.data || err.message);
      throw new Error(err.response?.data?.error?.message || err.message || 'Lỗi khi upload lên Cloudinary.');
    }

    const fileUrl = uploadRes.data.secure_url;
    const isStudent = booking.studentId === senderId;

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          bookingId,
          senderId,
          content: `📁 Đã gửi tệp: ${fileName}`,
          fileUrl,
          fileName,
          fileSize,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: isStudent ? { studentLastReadAt: new Date() } : { mentorLastReadAt: new Date() },
      })
    ]);

    emitBookingUpdate(booking.studentId, booking.mentorId, booking.id, booking.status);
    emitChatMessage(booking.id, message);

    return message;
  }
}
