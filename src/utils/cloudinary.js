import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload on clodinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("file successfully uploaded on cloudinary : ", response.url);

    // now unlink file from local server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //removes the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (oldAvatar) => {
  try {
    if (!oldAvatar) return null;

    //delete from clodinary
    const oldAvatarPublicId = oldAvatar.split("/")[7].split(".")[0];
    const result = await cloudinary.api.delete_resources([oldAvatarPublicId]);
    return result;
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while deleting from cloudinary"
    );
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
