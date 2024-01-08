import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Sever running fine...."));
});

export { healthcheck };
