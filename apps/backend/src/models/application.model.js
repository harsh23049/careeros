import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: [
                "saved",
                "applied",
                "pending",
                "oa",
                "interview",
                "offer",
                "accepted",
                "rejected",
                "withdrawn",
            ],
            required: true,
        },

        changedAt: {
            type: Date,
            default: Date.now,
        },

        note: {
            type: String,
            trim: true,
            maxlength: [500, "Status note cannot exceed 500 characters"],
        },
    },
    {
        _id: false,
    }
);

const applicationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true,
        },

        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
        },

        coverLetter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CoverLetter",
        },

        aiHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AIHistory",
            },
        ],

        status: {
            type: String,
            enum: [
                "saved",
                "applied",
                "pending",
                "oa",
                "interview",
                "offer",
                "accepted",
                "rejected",
                "withdrawn",
            ],
            default: "saved",
            index: true,
        },

        appliedAt: {
            type: Date,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [2000, "Notes cannot exceed 2000 characters"],
        },

        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Application = mongoose.model(
    "Application",
    applicationSchema
);

export default Application;