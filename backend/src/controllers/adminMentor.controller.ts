import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.config';
import { ApiError } from '../middlewares/error.middleware';

export class AdminMentorController {
  /**
   * GET /api/v1/admin/mentor-requests
   * Get list of all mentor upgrade requests, filtered by status
   */
  static async getAllRequests(req: any, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const whereClause: any = {};
      
      if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
        whereClause.status = status;
      }

      const requests = await (prisma as any).mentorRequest.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              phone: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách yêu cầu nâng cấp Mentor thành công',
        data: requests
      });

    } catch (err: any) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/mentor-requests/:id/approve
   * Approve a mentor upgrade request
   */
  static async approveRequest(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const request = await (prisma as any).mentorRequest.findUnique({
        where: { id }
      });

      if (!request) {
        throw new ApiError('Không tìm thấy yêu cầu nâng cấp này!', 404);
      }

      if (request.status !== 'PENDING') {
        throw new ApiError(`Yêu cầu này đã được xử lý trước đó với trạng thái: ${request.status}`, 400);
      }

      // Perform updates inside a transaction
      await prisma.$transaction([
        (prisma as any).mentorRequest.update({
          where: { id },
          data: { status: 'APPROVED' }
        }),
        prisma.user.update({
          where: { id: request.userId },
          data: {
            role: 'MENTOR',
            verify: true,
            status: 'active'
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        message: 'Phê duyệt tài khoản lên Mentor thành công!'
      });

    } catch (err: any) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/mentor-requests/:id/reject
   * Reject a mentor upgrade request
   */
  static async rejectRequest(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        throw new ApiError('Vui lòng cung cấp lý do từ chối yêu cầu!', 400);
      }

      const request = await (prisma as any).mentorRequest.findUnique({
        where: { id }
      });

      if (!request) {
        throw new ApiError('Không tìm thấy yêu cầu nâng cấp này!', 404);
      }

      if (request.status !== 'PENDING') {
        throw new ApiError(`Yêu cầu này đã được xử lý trước đó với trạng thái: ${request.status}`, 400);
      }

      await (prisma as any).mentorRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          adminComment: reason
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Đã từ chối yêu cầu nâng cấp tài khoản.'
      });

    } catch (err: any) {
      next(err);
    }
  }
}
