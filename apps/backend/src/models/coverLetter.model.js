import mongoose from "mongoose";

const coverLetterSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        },

        title: {
            type: String,
            required: [true, "Cover letter title is required"],
            trim: true,
            maxlength: [
                150,
                "Cover letter title cannot exceed 150 characters",
            ],
        },

        content: {
            type: String,
            required: [true, "Cover letter content is required"],
            trim: true,
        },

        generatedByAI: {
            type: Boolean,
            default: false,
        },

        aiModel: {
            type: String,
            trim: true,
        },

        prompt: {
            type: String,
            trim: true,
        },

        version: {
            type: Number,
            default: 1,
            min: [1, "Version must be at least 1"],
        },

        isUsed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const CoverLetter = mongoose.model(
    "CoverLetter",
    coverLetterSchema
);

export default CoverLetter;