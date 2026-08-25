import mongoose from "mongoose";

const aiHistorySchema = new mongoose.Schema(
    {
        // User who triggered the AI operation
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Application associated with this AI operation
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            index: true,
        },

        // Job associated with the AI operation
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            index: true,
        },

        // What the AI was asked to do
        type: {
            type: String,
            enum: [
                "job_analysis",
                "resume_analysis",
                "resume_tailoring",
                "cover_letter",
                "resume_match",
                "application_answer",
                "recruiter_email",
                "interview_prep",
            ],
            required: true,
            index: true,
        },

        // AI model used
        model: {
            type: String,
            trim: true,
        },

        // Input sent to the AI
        input: {
            type: mongoose.Schema.Types.Mixed,
        },

        // AI-generated result
        output: {
            type: mongoose.Schema.Types.Mixed,
        },

        // Whether the user accepted/used the AI result
        accepted: {
            type: Boolean,
            default: false,
        },

        // Optional token/usage information
        usage: {
            promptTokens: {
                type: Number,
                min: 0,
            },

            completionTokens: {
                type: Number,
                min: 0,
            },

            totalTokens: {
                type: Number,
                min: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

const AIHistory = mongoose.model(
    "AIHistory",
    aiHistorySchema
);

export default AIHistory;