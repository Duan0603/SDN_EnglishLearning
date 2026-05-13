import express from "express";
import {asyncHandler} from "../../auth/checkAuth.js";
import {AccessController} from "../../controllers/access.controller.js";

export const accessRouter = express.Router();

accessRouter.post('/user/signup', asyncHandler(AccessController.signUp))