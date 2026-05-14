import express from "express";
import {asyncHandler} from "../../auth/checkAuth.js";
import {AccessController} from "../../controllers/access.controller.js";

export const userRouter = express.Router();

// Auth routes for user
userRouter.post('/signup', asyncHandler(AccessController.signUp))
userRouter.post('/login', asyncHandler(AccessController.signIn))

// Profile routes (placeholder)
// userRouter.get('/profile', ...)

