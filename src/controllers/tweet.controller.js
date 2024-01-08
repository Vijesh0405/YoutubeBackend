import mongoose, { isValidObjectId } from "mongoose";
import { User, Tweet } from "../models/index.js";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  try {
    const tweet = await Tweet.create({
      content,
      owner: req.user?._id,
    });
    if (!tweet) {
      throw new ApiError(
        500,
        "tweet not created,Internal server error,try again later"
      );
    }
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "error occurred during creating a tweet"
    );
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (isValidObjectId(userId)) {
    throw new ApiError("invalid userId");
  }
  try {
    const tweets = await Tweet.find({ owner: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "can't fetch tweets,internal server problem,try again later"
    );
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweetId");
  }
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content: content,
        },
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Internal server while updating tweet,try again later"
    );
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweetId");
  }
  try {
    await Tweet.findByIdAndDelete(tweetId);
    return res
      .status(200)
      .json(new ApiResponse(200, "tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Internal server while deleting tweet,try again later"
    );
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
