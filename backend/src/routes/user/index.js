import express from "express";
import {asyncHandler} from "../../auth/checkAuth.js";
import {AccessController} from "../../controllers/access.controller.js";
import {PasswordController} from "../../controllers/password.controller.js";
import {authentication} from "../../auth/authUtils.js";

export const userRouter = express.Router();

// Auth routes for user
userRouter.post('/signup', asyncHandler(AccessController.signUp))
userRouter.post('/login', asyncHandler(AccessController.signIn))

// Forgot password routes
userRouter.post('/forgot-password', asyncHandler(PasswordController.forgotPassword))
userRouter.post('/verify-otp', asyncHandler(PasswordController.verifyOtp))
userRouter.post('/reset-password', asyncHandler(PasswordController.resetPassword))

// Authentication required
userRouter.use(authentication)
userRouter.get('/profile', asyncHandler(AccessController.getProfile))
