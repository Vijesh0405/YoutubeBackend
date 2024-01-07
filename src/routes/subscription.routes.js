import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { handleSubscribe, handleUnSubscribe} from "../controllers/subscription.controllers.js";



const router = Router()

router.route('/sub/:channelId')
.post(verifyJwt,handleSubscribe)

router.route('/unSub/:channelId')
.post(verifyJwt,handleUnSubscribe)


export default router