import { Router } from "express";
import {verifyJwt} from '../middlewares/auth.middleware.js'
import { handleWatchRequest } from "../controllers/watch.controllers.js";
const router = Router()

router.route('/:videoId')
.get(verifyJwt,handleWatchRequest)

export default router