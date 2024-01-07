import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { toggleSubscription} from "../controllers/subscription.controller.js";



const router = Router()



export default router