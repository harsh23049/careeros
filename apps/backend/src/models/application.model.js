import mongoose from "mongoose";
// STATUS HISTORY SCHEMA
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
            default: "saved",
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
// APPLICATION SCHEMA
const applicationSchema = new mongoose.Schema(
    {
        // Owner
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Job Information
        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
            maxlength: [100, "Company name cannot exceed 100 characters"],
        },

        jobTitle: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
            maxlength: [150, "Job title cannot exceed 150 characters"],
        },

        jobUrl: {
            type: String,
            trim: true,
        },
        // Application Status
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
        // Application Date
        appliedAt: {
            type: Date,
        },
        // Job Details
        location: {
            type: String,
            trim: true,
            maxlength: [100, "Location cannot exceed 100 characters"],
        },

        employmentType: {
            type: String,
            enum: [
                "full-time",
                "part-time",
                "internship",
                "contract",
                "freelance",
            ],
        },
        // Salary
        salary: {
            min: {
                type: Number,
                min: [0, "Salary cannot be negative"],
            },

            max: {
                type: Number,
                min: [0, "Salary cannot be negative"],
            },

            currency: {
                type: String,
                trim: true,
                uppercase: true,
                default: "INR",
            },

            period: {
                type: String,
                enum: [
                    "hour",
                    "month",
                    "year",
                ],
            },
        },
        // Notes
        notes: {
            type: String,
            trim: true,
            maxlength: [2000, "Notes cannot exceed 2000 characters"],
        },
        // Status History
        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);
// MODEL
const Application = mongoose.model(
    "Application",
    applicationSchema
);

export default Application;