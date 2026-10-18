import userRepository from "../repositories/user.repository.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import { sendPasswordResetEmail } from "./email.service.js";

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

const refreshAccessToken = async (refreshToken) => {

    if (!refreshToken) {
        throw new ApiError(
            401,
            "Refresh token is required"
        );
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired refresh token"
        );
    }

    const user =
        await userRepository.findById(
            decodedToken._id
        );

    if (!user) {
        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }

    if (
        user.refreshToken !== refreshToken
    ) {
        throw new ApiError(
            401,
            "Refresh token has been revoked"
        );
    }

    const newAccessToken =
        user.generateAccessToken();

    return newAccessToken;
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
// PASSWORD RESET
// =====================================================

const forgotPassword = async (email) => {
    if (!email || !email.trim()) {
        throw new ApiError(400, "Email address is required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (user) {
        // Generate unpredictable 32-byte token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before storing in MongoDB
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // 15-minute expiry
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await userRepository.save(user);

        // Build reset link using frontend URL
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        const emailResult = await sendPasswordResetEmail(user.email, resetUrl);

        return {
            message: "If an account exists for this email, a password reset link has been sent.",
            delivered: Boolean(emailResult.delivered),
            smtpConfigured: Boolean(emailResult.configured),
            smtpError: process.env.NODE_ENV !== "production" ? (emailResult.error || null) : null,
            devResetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
        };
    }

    // Always return generic message to prevent account enumeration
    return {
        message: "If an account exists for this email, a password reset link has been sent.",
        delivered: false,
        smtpConfigured: Boolean(
            (process.env.SMTP_HOST || process.env.SMTP_SERVICE) &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS
        ),
        devResetUrl: undefined,
    };
};

const resetPassword = async (plainToken, newPassword) => {
    if (!plainToken || typeof plainToken !== "string" || !plainToken.trim()) {
        throw new ApiError(400, "Reset token is required");
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    // Hash the plain token using SHA-256 to compare with stored hash
    const hashedToken = crypto
        .createHash("sha256")
        .update(plainToken.trim())
        .digest("hex");

    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
        throw new ApiError(400, "Password reset token is invalid or has expired");
    }

    // Set new password (pre-save hook will hash with bcrypt)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    user.refreshToken = null; // Revoke existing refresh tokens

    await userRepository.save(user);

    return "Password has been reset successfully. You may now log in.";
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
    forgotPassword,
    resetPassword,
};