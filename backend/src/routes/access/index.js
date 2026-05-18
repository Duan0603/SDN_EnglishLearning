import express from "express";
import {asyncHandler} from "../../auth/checkAuth.js";
import {AccessController} from "../../controllers/access.controller.js";

export const accessRouter = express.Router();

// Access routes (logout, refresh token, etc.)
// accessRouter.post('/logout', asyncHandler(AccessController.logout))
