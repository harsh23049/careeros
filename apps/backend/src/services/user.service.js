import userRepository from "../repositories/user.repository.js";
import ApiError from "../utils/ApiError.js";

// =====================================================
// Helper
// =====================================================

const sanitizeUser = (user) => {
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.refreshToken;

    return userObject;
};


// =====================================================
// AUTHENTICATION
// =====================================================

const registerUser = async ({
    fullName,
    username,
    email,
    password,
}) => {

    // Check email
    const existingEmail =
        await userRepository.findByEmail(email);

    if (existingEmail) {
        throw new ApiError(
            409,
            "Email is already registered"
        );
    }

    // Check username
    const existingUsername =
        await userRepository.findByUsername(username);

    if (existingUsername) {
        throw new ApiError(
            409,
            "Username is already taken"
        );
    }

    // Create user
    const user = await userRepository.create({
        fullName,
        username,
        email,
        password,
    });

    return sanitizeUser(user);
};


const loginUser = async (email, password) => {

    // Find user
    const user =
        await userRepository.findByEmail(email);

    if (!user) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    // Verify password
    const isPasswordCorrect =
        await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    // Generate tokens
    const accessToken =
        user.generateAccessToken();

    const refreshToken =
        user.generateRefreshToken();

    // Store refresh token
    await userRepository.updateRefreshToken(
        user._id,
        refreshToken
    );

    return {
        user: sanitizeUser(user),
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


// =====================================================
// TOKEN
// =====================================================

const refreshAccessToken = async (userId) => {

    const user =
        await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const accessToken =
        user.generateAccessToken();

    return accessToken;
};


// =====================================================
// PROFILE
// =====================================================

const getCurrentUser = async (userId) => {

    const user =
        await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    return sanitizeUser(user);
};


const updateProfile = async (
    userId,
    { fullName, username, email }
) => {

    const user =
        await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }


    // -----------------------------
    // Username
    // -----------------------------

    if (
        username &&
        username !== user.username
    ) {

        const existingUsername =
            await userRepository.findByUsername(username);

        if (
            existingUsername &&
            existingUsername._id.toString() !==
                userId.toString()
        ) {
            throw new ApiError(
                409,
                "Username is already taken"
            );
        }

        user.username = username;
    }


    // -----------------------------
    // Email
    // -----------------------------

    if (
        email &&
        email !== user.email
    ) {

        const existingEmail =
            await userRepository.findByEmail(email);

        if (
            existingEmail &&
            existingEmail._id.toString() !==
                userId.toString()
        ) {
            throw new ApiError(
                409,
                "Email is already registered"
            );
        }

        user.email = email;
    }


    // -----------------------------
    // Full Name
    // -----------------------------

    if (fullName) {
        user.fullName = fullName;
    }


    const updatedUser =
        await userRepository.save(user);

    return sanitizeUser(updatedUser);
};


const changePassword = async (
    userId,
    oldPassword,
    newPassword
) => {

    const user =
        await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }


    // Verify old password
    const isPasswordCorrect =
        await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Current password is incorrect"
        );
    }


    // Set new password
    // User model's pre("save") will hash it
    user.password = newPassword;

    await userRepository.save(user);

    return true;
};


// =====================================================
// AVATAR
// =====================================================

const updateAvatar = async (userId, file) => {

    if (!file) {
        throw new ApiError(400, "Avatar image is required");
    }

    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Upload new avatar to Cloudinary
    const { url, publicId } =
        await uploadToCloudinary(file.buffer);

    // Update user's avatar
    user.avatar = {
        url,
        publicId,
    };

    const updatedUser =
        await userRepository.save(user);

    return sanitizeUser(updatedUser);
};

// =====================================================
// ACCOUNT
// =====================================================

const deleteAccount = async (userId) => {

    const user =
        await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    await userRepository.deleteById(userId);

    return true;
};


// =====================================================
// EXPORTS
// =====================================================

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