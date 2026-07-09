import express from 'express';
import { asyncHandler } from '../../auth/checkAuth.js';
import { authentication } from '../../auth/authUtils.js';
import { AdminUserController } from '../../controllers/adminUser.controller.js';
import { AdminSubmissionController } from '../../controllers/adminSubmission.controller';
import { AdminMentorController } from '../../controllers/adminMentor.controller';

export const adminRouter = express.Router();

// All admin routes require a valid JWT
adminRouter.use(authentication);

// Middleware: Only ADMIN role allowed
adminRouter.use((req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admins only.' });
  }
  next();
});

// ── User CRUD ──────────────────────────────────────────────
adminRouter.get('/users', asyncHandler(AdminUserController.getAllUsers));
adminRouter.get('/users/:id', asyncHandler(AdminUserController.getUserById));
adminRouter.post('/users', asyncHandler(AdminUserController.createUser));
adminRouter.patch('/users/:id', asyncHandler(AdminUserController.updateUser));
adminRouter.delete('/users/:id', asyncHandler(AdminUserController.deleteUser));

// ── Special Status Actions ─────────────────────────────────
adminRouter.patch('/users/:id/status', asyncHandler(AdminUserController.toggleUserStatus));
adminRouter.patch('/users/:id/approve-mentor', asyncHandler(AdminUserController.approveMentor));

// ── Mentor Requests Management ──────────────────────────────
adminRouter.get('/mentor-requests', asyncHandler(AdminMentorController.getAllRequests));
adminRouter.patch('/mentor-requests/:id/approve', asyncHandler(AdminMentorController.approveRequest));
adminRouter.patch('/mentor-requests/:id/reject', asyncHandler(AdminMentorController.rejectRequest));

// ── Student Practice Results / Submissions Management ──────
adminRouter.get('/submissions', asyncHandler(AdminSubmissionController.getAllSubmissions));
adminRouter.delete('/submissions/:id', asyncHandler(AdminSubmissionController.deleteSubmission));
