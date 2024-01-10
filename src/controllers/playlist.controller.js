import mongoose, { isValidObjectId } from "mongoose";
import { Playlist, Video } from "../models/index.js";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!(name && description)) {
    throw new ApiError(400, "name and description is required");
  }
  try {
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist created successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Internal server error while creating playlist,try again later"
    );
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(400, "userId is missing");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "userId isn't valid");
  }
  try {
    const userPlaylists = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$owner",
          playlists: {
            $push: {
              _id: "$_id",
              name: "$name",
              description: "$description",
              videos: "$videos",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          owner: "$_id",
          playlists: 1,
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userPlaylists,
          "user playlists fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error ||
        "Internal server error while getting user playlists,try again later"
    );
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "playlistId is missing");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistId isn't valid");
  }
  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(
        404,
        "playlist not exist with this playlistId,try again with correct one"
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Internal server error while fetching playlist by Id,try again later"
    );
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "playlistId and videoId is missing");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistId isn't valid");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId isn't valid");
  }
  try {
    const video = await Video.find({
      $and: [{ _id: videoId }, { owner: req.user?._id }],
    });
    if (video.length === 0) {
      throw new ApiError(
        404,
        "Invalid videoId or video didn't uploaded by you"
      );
    }
    // console.log(video)
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      {
        $and:[{ _id: playlistId },{ owner: req.user?._id }],
      },
      {
        $push: { videos: videoId },
      },
      {
        new: true,
      }
    );
    if (!updatedPlaylist) {
      throw new ApiError(
        400,
        "playlist doesn't exist or you don't have access to this"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "video added to playlist successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message ||
        "Internal server error while adding new video to playlist,try again later"
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "playlistId and videoId is missing");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistId isn't valid");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId isn't valid");
  }
  try {
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      {
        $and:[{ _id: playlistId },{ owner: req.user?._id }],
      },
      {
        $pull: {
          videos: { $in: [videoId] },
        },
      },
      {
        new: true,
      }
    );
    if (!updatedPlaylist) {
      throw new ApiError(
        404,
        "playlist not exist or you not have access to this"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "video removed from playlist successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || error,
      "Internal server error while adding new video to playlist,try again later"
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "playlistId is missing");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistId isn't valid");
  }
  try {
    const deletedPlaylist = await Playlist.findOneAndDelete({$and:[{_id:playlistId},{owner:req.user?._id}]});
    if (!deletedPlaylist) {
      throw new ApiError(
        404,
        "playlist doesn't exist or you don't have access to this"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedPlaylist, "playlist deleted successfully")
      );
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message ||
        "Internal server error while deleting a playlist,try again later"
    );
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(400, "playlistId is missing");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistId isn't valid");
  }
  try {
    const updateFields = {};
    if (name) {
      updateFields.name = name;
    }
    if (description) {
      updateFields.description = description;
    }
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      {$and:[{_id:playlistId},{owner:req.user?._id}]},
      {
        $set: updateFields,
      },
      {
        new: true,
      }
    );
    if (!updatedPlaylist) {
      throw new ApiError(
        404,
        "playlist doesn't exist or you don't have access to this"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
      );
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message ||
        "Internal server error while updating playlist,try again later"
    );
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
