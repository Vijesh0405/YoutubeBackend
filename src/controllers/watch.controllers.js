import { ApiError,asyncHandler,ApiResponse } from "../utils/index.js";
import {Video,User } from '../models/index.js'
const handleWatchRequest = asyncHandler( async (req,res)=>{
    try {
        const {videoId} = req?.params
        if(!videoId){
            throw new ApiError(404,"VideoId not found")
        }
        let video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(404,"video not exist")
        }
        const user = await User.findById(req.user?._id)
        if(user){
            video.views = video.views+1
            video = await video.save({validateBeforeSave:false},{new:true})
            console.log(video)
            user.watchHistory.push(videoId)
            await user.save({validateBeforeSave:false})
        }
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "video found"
            )
        )
    } catch (error) {
        throw new ApiError(404,`video not found : error ${error}`)
    }
})
export {handleWatchRequest}