import mongoose from "mongoose";
import { Like, Video, Subscription } from "../models/index.js";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  try {
    const channelStats = await Video.aggregate([
      {
        $match: {
          owner: req.user?._id,
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $group: {
          _id: "$owner",
          totalViews: {
            $sum: "$views",
          },
          totalVideos: {
            $sum: 1,
          },
          totalLikes: {
            $sum: { $size: "$likes" },
          },
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $addField: {
          subscribers: {
            $size: "$subscribers",
          },
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(200, channelStats, "channelStats fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Internal server error while fetching channel stats,try again later"
    );
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  try {
    const channelVideos = await Video.aggregate([
      {
        $match: {
          owner: req.user?._id,
        },
      },
      {
        $project: {
          owner: 0,
        },
      },
    ]);
    return res.status(200).json(new ApiResponse(200, channelVideos,"channelVideos fetched successfully"));
  } catch (error) {
    throw new ApiError(500,"Internal server error while fetching channel videos")
  }
});

export { getChannelStats, getChannelVideos };
