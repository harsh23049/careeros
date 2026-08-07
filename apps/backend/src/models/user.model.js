import mongoose from "mongoose";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,   
            required: [true, "Please provide your full name"],
            trim: true,
            minlength: [3, "Name must be at least 3 charaters long"],
            maxlength: [50, "Name must not be more than 50 charaters long"],
        },
        email:{
            type: String,
            required: [true, "Please provide your email"],
            unique: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                "Please provide a valid email",
            ],
        },
        password:{
            type: String,
            required: [true, "Please provide a password"],
            minlength: [6, "Password must be at least 6 charaters long"],
        },
        avatar: {
            type: String,
            default: "https://res.cloudinary.com/dxjzq6v0g/image/upload/v1686940915/avatars/default-avatar_ow1k3r.png",
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    { timestamps: true
    }
)