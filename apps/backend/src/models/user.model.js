import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Please provide your full name"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters long"],
            maxlength: [50, "Name must not be more than 50 characters long"],
        },
        username: {
            type: String,
            required: [true, "Please provide your username"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters long"],
            maxlength: [30, "Username must not be more than 30 characters long"],
        },  
        email: {
            type: String,
            required: [true, "Please provide your email"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                "Please provide a valid email",
            ],
        },

        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [6, "Password must be at least 6 characters long"],
        },

        avatar: {
            url: {
                type: String,
                default:
                    "https://res.cloudinary.com/dxjzq6v0g/image/upload/v1686940915/avatars/default-avatar_ow1k3r.png",
            },
            publicId: {
                type: String,
                default: "",
            },
        },

        refreshToken: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return; 
    }

    this.password = await bcrypt.hash(
        this.password,
        10
    );
});

userSchema.methods.isPasswordCorrect = async function (password) {

    return await bcrypt.compare(password, this.password);

};

userSchema.methods.generateAccessToken = function () {

    return jwt.sign(
        {
            _id: this._id,
            fullName: this.fullName,
            email: this.email,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );

};

userSchema.methods.generateRefreshToken = function () {

    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );

};

const User = mongoose.model("User", userSchema);

export default User;