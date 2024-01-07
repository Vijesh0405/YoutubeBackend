import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router()

router.route('/')
    .get((req, res) => {
        res.status(200).json("Hello from user server")
    })

router.route('/get-current-user')
    .get(verifyJwt,getCurrentUser)

router.route('/userid/:id')
    .get(getUser)


router.route('/register')
    .post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        registerUser
    )

router.route('/login')
    .post(loginUser)

// secured routes
router.route('/logout')
    .post(verifyJwt, logoutUser)

router.route('/refresh-token')
.post(refreshAccessToken)


//Account Update Routes

//change current password
router.route('/change-password')
.patch(verifyJwt,changeCurrentPassword)

//change fullName or email route
router.route('/change-account-details')
.patch(verifyJwt,updateAccountDetails)

//change avatar
router.route('/change-avatar')
.patch(
    verifyJwt,
    upload.single("avatar"),
    updateUserAvatar
)

//change coverImage
router.route('/change-cover-image')
.patch(
    verifyJwt,
    upload.single("coverImage"),
    updateUserCoverImage
)



//get user channel profile
router.route('/channel-profile/:username')
.get(
    verifyJwt,
    getUserChannelProfile
)

//get user watchHistory
router.route('/history')
.get(verifyJwt,getWatchHistory)


export default router