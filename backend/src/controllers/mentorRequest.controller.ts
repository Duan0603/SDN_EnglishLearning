import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.config';
import { ApiError } from '../middlewares/error.middleware';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

/**
 * POST /api/v1/users/me/mentor-request
 * Submit a request to upgrade role to Mentor
 */
export const createMentorRequest = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new ApiError('Unauthorized: Missing user credentials', 401);
    }

    const { certificates, bio, expertise } = req.body;

    if (!certificates || !Array.isArray(certificates) || certificates.length === 0) {
      throw new ApiError('Vui lòng cung cấp ít nhất một chứng chỉ tiếng Anh (file hoặc ảnh)!', 400);
    }

    // 1. Check user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError('Không tìm thấy tài khoản người dùng', 404);
    }

    if (user.role === 'MENTOR') {
      throw new ApiError('Tài khoản của bạn đã là Mentor rồi!', 400);
    }

    if (user.role === 'ADMIN') {
      throw new ApiError('Tài khoản Admin không thể gửi yêu cầu nâng cấp!', 400);
    }

    // 2. Check for any PENDING requests
    const pendingRequest = await (prisma as any).mentorRequest.findFirst({
      where: { userId, status: 'PENDING' }
    });

    if (pendingRequest) {
      throw new ApiError('Bạn đã có yêu cầu nâng cấp đang chờ duyệt! Vui lòng đợi Admin kiểm tra.', 400);
    }

    // 3. Upload certificates to Cloudinary
    const uploadedUrls: string[] = [];
    for (const cert of certificates) {
      const { filename, base64Data } = cert;
      if (!base64Data) {
        throw new ApiError('Dữ liệu file chứng chỉ không hợp lệ!', 400);
      }
      const url = await uploadBase64ToCloudinary(base64Data, filename || 'certificate.jpg');
      uploadedUrls.push(url);
    }

    // 4. Create MentorRequest
    const newRequest = await (prisma as any).mentorRequest.create({
      data: {
        userId,
        certificates: uploadedUrls,
        bio: bio || '',
        expertise: expertise || '',
        status: 'PENDING'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu nâng cấp Mentor thành công!',
      data: newRequest
    });

  } catch (err: any) {
    next(err);
  }
};

/**
 * GET /api/v1/users/me/mentor-request
 * Get current user's latest mentor request status
 */
export const getMyMentorRequest = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new ApiError('Unauthorized: Missing user credentials', 401);
    }

    const latestRequest = await (prisma as any).mentorRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: latestRequest || null
    });

  } catch (err: any) {
    next(err);
  }
};
