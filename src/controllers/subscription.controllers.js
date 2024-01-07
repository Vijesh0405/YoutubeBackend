import {ApiError,ApiResponse,asyncHandler} from '../utils/index.js'
import { Subscription } from '../models/subscription.models.js'

const handleSubscribe = asyncHandler(async (req,res)=>{
    const {channelId} = req.params
    if(!channelId){
        return null
    }
    if(!req.user?._id){
        return null
    }
    if(channelId==req.user?._id){
        throw new ApiError(400,"can't subscribe yourself")
    }
    try {
        
        await Subscription.create(
            {
                subscriber:req.user?._id,
                channel:channelId
            }
        )
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "subscribed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500,"Error occurred during subscribing ")
    }
})

const handleUnSubscribe = asyncHandler(async(req,res)=>{
    try {
        const {channelId}  = req.params
        if(!channelId){
            return null
        }
        if(!req.user){
            return null
        }
        await Subscription.findOneAndDelete({
            subscriber:req.user?._id,
            channel:channelId
        })
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Unsubscribed Successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500,"Error occurred while unsubscribing")
    }
})

export {handleSubscribe,handleUnSubscribe}