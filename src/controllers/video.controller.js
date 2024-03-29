import { User, Video } from "../models/index.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError, asyncHandler, ApiResponse } from "../utils/index.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  //create filters
  const filters = {};
  if (query) {
    filters.$or = [
      //*use "$regex" to find query pattern in both title and description
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }, //* "i" for case-insensitive search
    ];
  }
  if (userId) {
    filters.owner = userId;
  }
  //*checking for published video
  filters.isPublished = true

  //make sortOptions
  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "ascending" ? 1 : -1;
  }
  const videos = await Video.find(filters)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, page: parseInt(page, 10), limit: parseInt(limit, 10) },
        "videos fetched successfully"
      )
    );
});

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
  //upload to cloudinary
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

  const video = await Video.findOne({$and:[{_id:videoId},{owner:req.user?._id}]});
  if (!video) {
    throw new ApiError(404, "video doesn't exist or you don't have access to do this");
  }
  //* if none of them present then simply return our existing video, nothing to do
  if (!(title || description || thumbnailLocalPath)) {
    return res.status(200).json(new ApiResponse(200, video,"no changes done"));
  }

  //* else upload thumbnail(if available) to cloudinary and  update other fields also
  const updateOptions={}
  if (thumbnailLocalPath) {
    //first delete previous one 
    const deletedThumbnail = await deleteFromCloudinary(video.thumbnail)
    if(!deletedThumbnail){
      throw new ApiError(500,"Internal server error while deleting thumbnail from cloudinary")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(thumbnail){
      updateOptions.thumbnail=thumbnail.url
    }
  }
  if(title) {updateOptions.title=title}
  if(description){updateOptions.description=description}
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateOptions,
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
    const deletedVideo = await Video.findOneAndDelete({$and:[{_id:videoId},{owner:req.user?._id}]});
    console.log(deletedVideo);
    if (!deletedVideo) {
      throw new ApiError(404, "video doesn't exist or you don't have access to do this");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, deletedVideo, "video deleted successfully"));
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Error occurred while deleting video"
    );
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId missing");
  }
  try {
    const video = await Video.findOne({$and:[{_id:videoId},{owner:req.user?._id}]})
    if(!video){
      throw new ApiError(404,"video doesn't exist or you don't have access to do this")
    }
    video.isPublished = !video.isPublished
    const updatedVideo = await video.save({validateBeforeSave:false})
    return res
      .status(200)
      .json(new ApiResponse(200, updatedVideo, "publishStatus toggled successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode||500,
      error.message || `Error occurred during toggling publishStatus : ${error}`
    );
  }
});
export {
  getAllVideos,
  handleVideoPost,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
