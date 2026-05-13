//file tong de quan ly toan bo route

import express from "express";
import {accessRouter} from "./access/index.js";

export const router = express.Router()

router.use('/v1/api', accessRouter)