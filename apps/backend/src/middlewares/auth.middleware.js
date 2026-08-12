import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import userRepository from "../repositories/user.repository.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
    );

    const user = await userRepository.findById(
        decodedToken._id
    );

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;

    next();
});

export default authMiddleware;