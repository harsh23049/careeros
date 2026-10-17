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
 
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const authData = await userService.loginUser(email, password);

    // Set secure HttpOnly cookies for browser clients while keeping authData in JSON for extension/API clients
    res.cookie("accessToken", authData.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", authData.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                authData,
                "User logged in successfully"
            )
        );
});

const logOutUser = asyncHandler(async (req, res) => {

    await userService.logoutUser(req.user._id);

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

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

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

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

const forgotPasswordUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await userService.forgotPassword(email);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    delivered: Boolean(result?.delivered),
                    devResetUrl: result?.devResetUrl || null,
                },
                typeof result === "string" ? result : (result?.message || "If an account exists for this email, a password reset link has been sent.")
            )
        );
});

const resetPasswordUser = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const message = await userService.resetPassword(token, newPassword);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                message
            )
        );
});

const changePassword = asyncHandler(async (req, res) => {

    const {
        oldPassword,
        newPassword,
    } = req.body;

    await userService.changePassword(
        req.user._id,
        oldPassword,
        newPassword
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Password changed successfully"
            )
        );
});

const updateAvatar = asyncHandler(async (req, res) => {

    const user =
        await userService.updateAvatar(
            req.user._id,
            req.file
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Avatar updated successfully"
            )
        );
});

const deleteAccount = asyncHandler(async (req, res) => {
    await userService.deleteAccount(req.user._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Account deleted successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logOutUser,
    me,
    updateUserInfo,
    refreshAccessToken,
    changePassword,
    updateAvatar,
    deleteAccount,
    forgotPasswordUser,
    resetPasswordUser,
};
