import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.config';

export const roleGuard = (allowedRoles: string[]) => {
  return async (req: any, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          error: { code: 401, message: 'Unauthorized: Missing user credentials' }
        });
      }

      // Fetch user from DB to verify current status and role
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: 'User not found' }
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: { code: 403, message: 'Forbidden: User account is inactive' }
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: { code: 403, message: 'Forbidden: Insufficient permissions' }
        });
      }

      // Attach complete user record to request
      req.currentUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
