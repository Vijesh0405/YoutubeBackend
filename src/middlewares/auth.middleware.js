import jwt  from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";


export const verifyJwt = asyncHandler(async (req,res,next)=>{

    try {
        //find token from req.cookies or from headers(for mobile stuff)
        //header me key "Authorization" or value "Bearer <token>" hoti hai to hum "Bearer " ko hata dete hai to token mil jayega
        const token  = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        //verify token from jwt or decode it 
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) 
        //decoded token holds the payload jo hamne access token generate krte time use kiya tha
    
        //find user 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        //check user
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }

        //enject user object in req
        req.user = user
    
        //call next
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
    }

})