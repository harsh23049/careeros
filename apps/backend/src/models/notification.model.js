import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "application_update",
                "interview_reminder",
                "application_followup",
                "application_rejected",
                "application_offer",
                "ai_completed",
                "system",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [
                150,
                "Notification title cannot exceed 150 characters",
            ],
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: [
                500,
                "Notification message cannot exceed 500 characters",
            ],
        },

        read: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
        },

        relatedApplication: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
        },

        relatedInterview: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;