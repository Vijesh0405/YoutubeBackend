import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/index.js"
import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }
    const likedVideo = await Like.findOneAndDelete(
        {
            video:videoId,
            likedBy:req.user?._id
        }
    )
    if(likedVideo==null){
        //* means no like is available to this videoId, so create a new Like
        try {
            const like = await Like.create(
                {
                    video:videoId,
                    likedBy:req.user?._id
                }
            )
            return res.status(200).json(new ApiResponse(200,{isLiked:true,videoLike:like},"video liked successfully"))
        } catch (error) {
            throw new ApiError(500,"Internal Server Error,during creating videoLike")
        }
    }
    //* else we already deleted likedVideo so directly send response of dislike
    return res.status(200).json(new ApiResponse(200,{isLiked:false,videoLike:likedVideo},"video disliked Successfully"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid commentId")
    }
    const likedComment = await Like.findOneAndDelete(
        {
            comment:commentId,
            likedBy:req.user?._id
        }
    )
    if(likedComment==null){
        //* means no like is available to this commentId, so create a new Like
        try {
            const like = await Like.create(
                {
                    comment:commentId,
                    likedBy:req.user?._id
                }
            )
            return res.status(200).json(new ApiResponse(200,{isLiked:true,commentLike:like},"comment liked successfully"))
        } catch (error) {
            throw new ApiError(500,"Internal Server Error,during creating commentLike")
        }
    }
    //* else we already deleted likedComment so directly send response of dislike
    return res.status(200).json(new ApiResponse(200,{isLiked:false,commentLike:likedComment},"comment disliked Successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweetId")
    }
    const likedTweet = await Like.findOneAndDelete(
        {
            tweet:tweetId,
            likedBy:req.user?._id
        }
    )
    if(likedTweet==null){
        //* means no like is available to this tweetId, so create a new Like
        try {
            const like = await Like.create(
                {
                    tweet:tweetId,
                    likedBy:req.user?._id
                }
            )
            return res.status(200).json(new ApiResponse(200,{isLiked:true,tweetLike:like},"tweet liked successfully"))
        } catch (error) {
            throw new ApiError(500,"Internal Server Error,during creating tweetLike")
        }
    }
    //* else we already deleted likedTweet so directly send response of dislike
    return res.status(200).json(new ApiResponse(200,{isLiked:false,tweetLike:likedTweet},"tweet disliked Successfully"))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
        const likedVideos = await Like.aggregate(
            [
                {
                    $match:{
                        likedBy:req.user?._id,
                        video:{$exist:true,$ne:null}
                    }
                },
                {
                    $lookup:{
                        from:"videos",
                        localField:"video",
                        foreignField:"_id",
                        as:"video"
                    }
                },
                {
                    $addFields:{
                        video:{
                            $first:"$video"
                        }
                    }
                },
                {
                    $group:{
                        _id:"likedBy",
                        likedVideos:{
                            $push:"$video"
                        }
                    }
                },
                {
                    $project:{
                        _id:0,
                        likedVideos:1
                    }
                }
            ]
        )

        return res.status(200).json(new ApiResponse(200,{likedVideos},"liked videos fetched successfully"))
    } catch (error) {
        throw new ApiError(500,"can't fetch liked videos ,Internal server error ,try again later")
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}