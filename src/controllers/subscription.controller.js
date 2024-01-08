import mongoose, { isValidObjectId } from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { Subscription, User } from "../models/index.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channelId is not valid");
  }
  //*check if channel exists or not
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "channel not found,can't subscribe/unsubscribe");
  }
  try {
    const response = await Subscription.findOneAndDelete({
      $and: [{ subscriber: req.user?._id }, { channel: channelId }],
    });
    if (response === null) {
      //*No document found matching the specified filter means user is not subscribed channel
      //*so make him subscribed by simply creating a subscription document

      const subscription = await Subscription.create({
        subscriber: req.user?._id,
        channelId: channelId,
      });
      if (!subscription) {
        throw new ApiError(500, "Something went while subscribing channel");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { subscribed: true, subscription },
            "channel subscribed successfully"
          )
        );
    }
    //* else if response.value not null means subscription document deleted successfully and Unsubscribe part also done so simply return success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribed: false, subscription: response },
          "channel unsubscribed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error);
  }
});

//*controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addField: {
        subscriber: {
          $arrayElemAt: ["$subscriber", 0],
        },
      },
    },
    {
      $group: {
        _id: "$channel",
        subscribers: {
          $push: "$subscriber",
        },
      },
    },
    {
      $project: {
        _id: 0,
        subscribers: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers },
        "channel subscribers fetched successfully"
      )
    );
});

//*controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriberId");
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addField: {
        channel: {
          $first: "$channel",
        },
      },
    },
    {
      $group: {
        _id: "subscriber",
        channels: {
          $push: "$channel",
        },
      },
    },
    {
      $project: {
        _id: 0,
        channels: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channels },
        "subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
