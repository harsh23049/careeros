import userRepository from "../repositories/user.repository.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";


// ==================== AUTHENTICATION ====================
const registerUser = async ({
    fullName,
    username,
    email,
    password,
}) => {
    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(email);

    if (existingEmail) {
        throw new ApiError(409, "Email is already registered");
    }

    // Check if username already exists
    const existingUsername =
        await userRepository.findByUsername(username);

    if (existingUsername) {
        throw new ApiError(409, "Username is already taken");
    }

    // Create user
    const user = await userRepository.create({
        fullName,
        username,
        email,
        password,
    });

    // Don't return password or refresh token
    const createdUser = await userRepository.findById(user._id);

    return createdUser;
};


const loginUser = async (email, password) => {
    // Find user
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Check password
    const isPasswordCorrect =
        await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    await userRepository.updateRefreshToken(
        user._id,
        refreshToken
    );

    return {
        user,
        accessToken,
        refreshToken,
    };
};


const logoutUser = async (userId) => {

    await userRepository.updateRefreshToken(
        userId,
        null
    );

    return true;
};


const refreshAccessToken = async (userId) => {

    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();

    return accessToken;
};


// ==================== PROFILE ====================

const getCurrentUser = async (userId) => {

    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};


const updateProfile = async (
    userId,
    { fullName, username, email }
) => {

    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check username if changed
    if (username && username !== user.username) {

        const existingUsername =
            await userRepository.findByUsername(username);

        if (
            existingUsername &&
            existingUsername._id.toString() !== userId.toString()
        ) {
            throw new ApiError(409, "Username is already taken");
        }

        user.username = username;
    }

    // Check email if changed
    if (email && email !== user.email) {

        const existingEmail =
            await userRepository.findByEmail(email);

        if (
            existingEmail &&
            existingEmail._id.toString() !== userId.toString()
        ) {
            throw new ApiError(409, "Email is already registered");
        }

        user.email = email;
    }

    if (fullName) {
        user.fullName = fullName;
    }

    await user.save();

    return user;
};


const changePassword = async (
    userId,
    oldPassword,
    newPassword
) => {

    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify old password
    const isPasswordCorrect =
        await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Current password is incorrect");
    }

    // Assign new password
    // pre("save") will automatically hash it
    user.password = newPassword;

    await user.save();

    return true;
};


const updateAvatar = async (
    userId,
    avatarUrl,
    publicId
) => {

    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.avatar = {
        url: avatarUrl,
        publicId,
    };

    await user.save();

    return user;
};


const deleteAccount = async (userId) => {

    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await userRepository.deleteById(userId);

    return true;
};


// ==================== EXPORTS ====================

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateProfile,
    changePassword,
    updateAvatar,
    deleteAccount,
};