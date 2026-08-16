import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
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

        description: {
            type: String,
            trim: true,
        },

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

        workMode: {
            type: String,
            enum: [
                "onsite",
                "hybrid",
                "remote",
            ],
        },

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

        skills: [
            {
                type: String,
                trim: true,
            },
        ],

        requirements: [
            {
                type: String,
                trim: true,
            },
        ],

        responsibilities: [
            {
                type: String,
                trim: true,
            },
        ],

        source: {
            type: String,
            trim: true,
        },

        extractedEntities: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        postedAt: {
            type: Date,
        },

        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Job = mongoose.model(
    "Job",
    jobSchema
);

export default Job;