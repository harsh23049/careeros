import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as userService from "../services/user.service.js";

const registerUser = asyncHandler(async (req, res) => {
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    console.log("REQ BODY:", req.body);
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

export { registerUser };