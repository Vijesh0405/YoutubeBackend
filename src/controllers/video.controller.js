import { User, Video } from "../models/index.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError, asyncHandler, ApiResponse } from "../utils/index.js";
const handleVideoPost = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!(title && description)) {
    throw new ApiError(400, "title and description are required");
  }
  // now check for videoFile and thumbnail
  const videoFilePath = req.files?.videoFile
    ? req.files?.videoFile[0]?.path
    : "";
  const thumbnailPath = req.files?.thumbnail
    ? req.files?.thumbnail[0]?.path
    : "";

  if (!(videoFilePath && thumbnailPath)) {
    throw new ApiError(400, "All files are required");
  }
  console.log(`${thumbnailPath} ${videoFilePath}`);
  //upload to clodinary
  const thumbnailRes = await uploadOnCloudinary(thumbnailPath);
  const videoRes = await uploadOnCloudinary(videoFilePath);

  if (!(thumbnailRes && videoRes)) {
    throw new ApiError(500, "upload failed,try again");
  }
  console.log("Video :", videoRes);
  console.log("Thumbnail : ", thumbnailRes);

  const video = await Video.create({
    videoFile: videoRes?.url,
    thumbnail: thumbnailRes?.url,
    owner: req.user?._id,
    duration: videoRes?.duration || 0,
    title,
    description,
  });
  if (!video) {
    throw new ApiError(500, "upload failed at video object creation");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req?.params;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  let video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not exist");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "unauthorized request");
  }
  video.views = video.views + 1;
  video = await video.save({ validateBeforeSave: false }, { new: true });
  console.log(video);
  user.watchHistory.push(videoId);
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, video, "video found"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }

  const title = req.body?.title;
  const description = req.body?.description;
  const thumbnailLocalPath = req.file?.path;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "invalid videoId");
  }
  //* if none of them present then simply return our existing video, nothing to do
  if (!(title || description || thumbnailLocalPath)) {
    // const existingVideo = await Video.aggregate(
    //     [
    //         {
    //             $match: {
    //                 _id: new mongoose.Types.ObjectId(videoId)
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: "users",
    //                 localField: "owner",
    //                 foreignField: "_id",
    //                 as: "owner",
    //                 pipeline:[
    //                     {
    //                         $project:{
    //                             username:1,
    //                             fullName:1,
    //                             avatar:1
    //                         }
    //                     }
    //                 ]
    //             }
    //         },
    //         {
    //             $addFields:{
    //                 owner:{
    //                     $first:"$owner"
    //                 }
    //             }
    //         }
    //     ]
    // )

    return res.status(200).json(new ApiResponse(200, video));
  }

  //* else upload thumbnail(if available) to cloudinary and  the update video
  const thumbnail = null;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail?.url,
        title: title ? title : video.title,
        description: description ? description : video.description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId missing");
  }
  //TODO: delete video
  try {
    const deleteVideo = await Video.findByIdAndDelete(videoId);
    return res
      .status(200)
      .json(new ApiResponse(200, deleteVideo, "video deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error occurred while deleting video");
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId missing");
  }
  try {
    await Video.findByIdAndUpdate(videoId, {
      $set: {
        isPublished: {
          $not: "$isPublished",
        },
      },
    });
    return res
        .status(200)
        .json(new ApiResponse(200,{},"publishStatus toggled successfully"))
  } catch (error) {
    throw new ApiError(500,`Error occurred during toggling publishStatus : ${error}`)
  }
});
export { handleVideoPost, getVideoById, updateVideo, deleteVideo,togglePublishStatus};
