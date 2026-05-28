import express from "express";
import {asyncHandler} from "../../auth/checkAuth.js";
import {authentication} from "../../auth/authUtils.js";
import {AccessController} from "../../controllers/access.controller.js";

export const accessRouter = express.Router();

// SignUp
accessRouter.post('/signup', asyncHandler(AccessController.signUp));

// SignIn 
accessRouter.post('/login', asyncHandler(AccessController.signIn));

// Authentication middleware
accessRouter.use(authentication);

// Access routes (logout, refresh token, etc.)
accessRouter.post('/logout', asyncHandler(AccessController.logout));
