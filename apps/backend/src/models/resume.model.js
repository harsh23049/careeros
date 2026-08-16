import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: [true, "Resume title is required"],
            trim: true,
            maxlength: [100, "Resume title cannot exceed 100 characters"],
        },

        file: {
            url: {
                type: String,
                required: [true, "Resume file URL is required"],
            },

            publicId: {
                type: String,
                default: "",
            },
        },

        version: {
            type: Number,
            default: 1,
            min: [1, "Resume version must be at least 1"],
        },

        isDefault: {
            type: Boolean,
            default: false,
        },

        skills: [
            {
                type: String,
                trim: true,
            },
        ],

        summary: {
            type: String,
            trim: true,
            maxlength: [
                1000,
                "Resume summary cannot exceed 1000 characters",
            ],
        },

        experience: [
            {
                company: {
                    type: String,
                    trim: true,
                },

                role: {
                    type: String,
                    trim: true,
                },

                location: {
                    type: String,
                    trim: true,
                },

                startDate: {
                    type: Date,
                },

                endDate: {
                    type: Date,
                },

                description: {
                    type: String,
                    trim: true,
                },
            },
        ],

        education: [
            {
                institution: {
                    type: String,
                    trim: true,
                },

                degree: {
                    type: String,
                    trim: true,
                },

                field: {
                    type: String,
                    trim: true,
                },

                startDate: {
                    type: Date,
                },

                endDate: {
                    type: Date,
                },
            },
        ],

        projects: [
            {
                name: {
                    type: String,
                    trim: true,
                },

                description: {
                    type: String,
                    trim: true,
                },

                technologies: [
                    {
                        type: String,
                        trim: true,
                    },
                ],

                url: {
                    type: String,
                    trim: true,
                },
            },
        ],

        extractedData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const Resume = mongoose.model(
    "Resume",
    resumeSchema
);

export default Resume;