import express from 'express';
import { asyncHandler } from '../../auth/checkAuth.js';
import { authentication } from '../../auth/authUtils.js';
import { AdminUserController } from '../../controllers/adminUser.controller.js';

export const adminRouter = express.Router();

// All admin routes require a valid JWT
adminRouter.use(authentication);

// Middleware: Only ADMIN role allowed
adminRouter.use((req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admins only.' });
  }
  next();
});

// ── User CRUD ──────────────────────────────────────────────
// GET    /api/v1/admin/users            → List all users (search/filter/pagination)
adminRouter.get('/users', asyncHandler(AdminUserController.getAllUsers));

// GET    /api/v1/admin/users/:id        → Get single user
adminRouter.get('/users/:id', asyncHandler(AdminUserController.getUserById));

// POST   /api/v1/admin/users            → Create new user
adminRouter.post('/users', asyncHandler(AdminUserController.createUser));

// PATCH  /api/v1/admin/users/:id        → Update user fields
adminRouter.patch('/users/:id', asyncHandler(AdminUserController.updateUser));

// DELETE /api/v1/admin/users/:id        → Delete user
adminRouter.delete('/users/:id', asyncHandler(AdminUserController.deleteUser));

// ── Special Status Actions ─────────────────────────────────
// PATCH  /api/v1/admin/users/:id/status         → Toggle active / inactive
adminRouter.patch('/users/:id/status', asyncHandler(AdminUserController.toggleUserStatus));

// PATCH  /api/v1/admin/users/:id/approve-mentor → Approve a Mentor profile
adminRouter.patch('/users/:id/approve-mentor', asyncHandler(AdminUserController.approveMentor));
