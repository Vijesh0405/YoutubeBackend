import mongoose, { isValidObjectId } from "mongoose";
import { Comment, Video } from "../models/index.js";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId is not valid or missing");
  }

  // const video = await Video.findById(videoId)
  // if(!video){
  //   throw new ApiError(404,"Invalid videoId,can't fetch comments")
  // }

  try {
    const comments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup:{
          from:"users",
          localField:"owner",
          foreignField:"_id",
          as:"owner",
          pipeline:[
            {
              $project:{
                username:1,
                avatar:1,
              }
            }
          ]
        }
      },
      {
        $lookup:{
          from:"likes",
          localField:"_id",
          foreignField:"comment",
          as:"likes"
        }
      },
      {
        $addFields:{
          owner:{
            $first:"$owner"
          },
          likes:{
            $size:"$likes"
          }
        }
      },
      {
        $project:{
          video:0
        }
      },
      {
        $skip:(page-1)*limit
      },{
        $limit:parseInt(limit)
      }
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { page: parseInt(page), limit: parseInt(limit), comments },
          "comments fetched Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, `Internal server error :${error}`);
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId or missing");
  }
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video doesn't exist,provide valid videoId");
  }
  try {
    const comment = await Comment.create({
      content,
      video: videoId,
      owner: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment added successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Internal server error during adding a comment,try again later"
    );
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId) {
    throw new ApiError(400, "commentId missing");
  }
  try {
    const updateFields = {}
    if(content){
      updateFields.content=content
    }
    const updatedComment = await Comment.findOneAndUpdate(
      { $and: [{ _id: commentId }, { owner: req.user?._id }] },
      {
        $set: updateFields,
      },
      {
        new: true,
      }
    );
    if (!updatedComment) {
      throw new ApiError(
        404,
        "comment doesn't exist or you don't have access to do this"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedComment, "comment updated successfully")
      );
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message ||
        "Internal server error while updating comment,try again later"
    );
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId or commentId missing");
  }
  try {
    const deletedComment = await Comment.findOneAndDelete({
      $and: [{ _id: commentId }, { owner: req.user?._id }],
    });
    //* deletedComment is null if no comment found
    if (!deletedComment) {
      throw new ApiError(
        404,
        "comment doesn't exist or you don't have access to do this"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedComment, "comment deleted successfully")
      );
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message ||
        "Internal server error while deleting a comment,try again later"
    );
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
