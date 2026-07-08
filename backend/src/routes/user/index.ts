import express from "express";
import {asyncHandler} from "../../auth/checkAuth";
import {AccessController} from "../../controllers/access.controller";
import {PasswordController} from "../../controllers/password.controller";
import {authentication} from "../../auth/authUtils";
import { getUserResults, getUserStats, checkInUser } from "../../controllers/user.controller";

export const userRouter = express.Router();

// Auth routes for user
userRouter.post('/signup', asyncHandler(AccessController.signUp))
userRouter.post('/login', asyncHandler(AccessController.signIn))
userRouter.post('/verify-2fa', asyncHandler(AccessController.verify2FA))

// Forgot password routes
userRouter.post('/forgot-password', asyncHandler(PasswordController.forgotPassword))
userRouter.post('/verify-otp', asyncHandler(PasswordController.verifyOtp))
userRouter.post('/reset-password', asyncHandler(PasswordController.resetPassword))

// Authentication required
userRouter.use(authentication)
userRouter.get('/profile', asyncHandler(AccessController.getProfile))
userRouter.patch('/profile', asyncHandler(AccessController.updateProfile))
userRouter.post('/upload-avatar', asyncHandler(AccessController.uploadAvatar))
userRouter.post('/change-password', asyncHandler(PasswordController.changePassword))

// Progress & analytics endpoints (used by mobile ProgressScreen)
userRouter.get('/me/results', asyncHandler(getUserResults))
userRouter.get('/me/stats',   asyncHandler(getUserStats))
userRouter.post('/me/checkin', asyncHandler(checkInUser))
userRouter.post('/me/test-streak', asyncHandler(async (req, res, next) => {
    const { updateTestStreak } = require("../../controllers/user.controller");
    await updateTestStreak(req, res, next);
}))
