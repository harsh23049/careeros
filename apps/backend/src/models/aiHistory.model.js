import mongoose from "mongoose";

const aiHistorySchema = new mongoose.Schema(
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
            index: true,
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        },

        type: {
            type: String,
            enum: [
                "job_analysis",
                "resume_analysis",
                "resume_tailoring",
                "cover_letter",
                "application_answer",
                "recruiter_email",
                "interview_preparation",
                "other",
            ],
            required: true,
        },

        prompt: {
            type: String,
            trim: true,
        },

        input: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        output: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        model: {
            type: String,
            trim: true,
        },

        tokensUsed: {
            type: Number,
            min: 0,
        },

        accepted: {
            type: Boolean,
            default: false,
        },

        acceptedAt: {
            type: Date,
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