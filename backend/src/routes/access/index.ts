import express from "express";
import {asyncHandler} from "../../auth/checkAuth.js";
import {authentication} from "../../auth/authUtils.js";
import {AccessController} from "../../controllers/access.controller.js";
import {PasswordController} from "../../controllers/password.controller.js";

export const accessRouter = express.Router();

// SignUp
accessRouter.post('/signup', asyncHandler(AccessController.signUp));

// Check Exists (Email, Username, Phone)
accessRouter.post('/check-exists', asyncHandler(AccessController.checkExists));

// SignIn 
accessRouter.post('/login', asyncHandler(AccessController.signIn));

// Google Login
accessRouter.post('/google-login', asyncHandler(AccessController.googleLogin));

// Forgot Password Flow
accessRouter.post('/forgot-password', asyncHandler(PasswordController.forgotPassword));
accessRouter.post('/verify-otp', asyncHandler(PasswordController.verifyOtp));
accessRouter.post('/reset-password', asyncHandler(PasswordController.resetPassword));

// Authentication middleware
accessRouter.use(authentication);

// Access routes (logout, refresh token, etc.)
accessRouter.post('/logout', asyncHandler(AccessController.logout));
accessRouter.get('/profile', asyncHandler(AccessController.getProfile));
accessRouter.patch('/profile', asyncHandler(AccessController.updateProfile));
