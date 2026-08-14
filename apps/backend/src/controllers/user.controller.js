import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as userService from "../services/user.service.js";

const registerUser = asyncHandler(async (req, res) => {
    const user = await userService.registerUser(req.body);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                user,
                "User registered successfully"
            )
        );
});
 
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await userService.loginUser(email, password);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User logged in successfully"
            )
        );
});

const logOutUser = asyncHandler(async (req, res) => {

    await userService.logoutUser(req.user._id);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "User logged out successfully"
            )
        );
});

const me = asyncHandler(async (req, res) => {
    const user = await userService.getCurrentUser(req.user._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User profile fetched successfully"
            )
        );
});

const updateUserInfo = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(
        req.user._id,
        req.body
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User profile updated successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(
    async (req, res) => {

        const refreshToken =
            req.cookies?.refreshToken ||
            req.body?.refreshToken;

        const accessToken =
            await userService.refreshAccessToken(
                refreshToken
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { accessToken },
                    "Access token refreshed successfully"
                )
            );
    }
);

export { registerUser, loginUser, logOutUser, me, updateUserInfo, refreshAccessToken };
