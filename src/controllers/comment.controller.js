import mongoose from "mongoose"
import {Comment} from "../models/index.js"
import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if(!videoId){
        throw new ApiError(400,"videoId is missing")
    }
    if(!content){
        throw new ApiError(400,"content is required")
    }
    try {
        const comment  = await Comment.create(
            {
                content,
                video:videoId,
                owner:req.user._id
            }
        )
        return res.status(200).json(new ApiResponse(200,comment,"comment added successfully"))
    } catch (error) {
        throw new ApiError(500,"Internal server error during adding a comment,try again later")
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if(!commentId){
        throw new ApiError(400,"commentId missing")
    }
    if(!content){
        throw new ApiError(400,"content missing")
    }
    try {
        const updatedComment  = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set:{
                    content:content
                }
            },{
                new:true
            }
        ) 
        return res.status(200).json(new ApiResponse(200,updatedComment,"comment updated successfully"))
    } catch (error) {
        throw new ApiError(500,"Internal server error while updating comment,try again later")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400,"commentId missing")
    }
    try {
        const deletedComment = await Comment.findByIdAndDelete(commentId)
        //* deletedComment is null if no comment found 
        return res.status(200).json(new ApiResponse(200,deletedComment,"comment deleted successfully"))
    } catch (error) {
        throw new ApiError(500,"Internal server error while deleting a comment,try again later")
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }