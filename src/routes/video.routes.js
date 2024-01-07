import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { handleVideoPost } from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/post")
.post(
    verifyJwt,
    upload.fields(
        [
            {
                name:"videoFile",
                maxCount:1
            },
            {
                name:"thumbnail",
                maxCount:1
            }
        ]
    ),
    handleVideoPost)

export default router