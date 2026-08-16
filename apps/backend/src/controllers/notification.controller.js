import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as notificationService from "../services/notification.service.js";

// Create a notification
const createNotification = asyncHandler(async (req, res) => {
    const notification =
        await notificationService.createNotification(
            req.user._id,
            req.body
        );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                notification,
                "Notification created successfully"
            )
        );
});

// Get all notifications of the current user
const getUserNotifications = asyncHandler(async (req, res) => {
    const unreadOnly =
        req.query.unreadOnly === "true";

    const notifications =
        await notificationService.getUserNotifications(
            req.user._id,
            unreadOnly
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notifications,
                "Notifications fetched successfully"
            )
        );
});

// Get a single notification
const getNotification = asyncHandler(async (req, res) => {
    const notification =
        await notificationService.getNotification(
            req.params.id,
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notification,
                "Notification fetched successfully"
            )
        );
});

// Mark a notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification =
        await notificationService.markNotificationAsRead(
            req.params.id,
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notification,
                "Notification marked as read"
            )
        );
});

// Mark all notifications as read
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllNotificationsAsRead(
        req.user._id
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "All notifications marked as read"
            )
        );
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(
        req.params.id,
        req.user._id
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Notification deleted successfully"
            )
        );
});

export {
    createNotification,
    getUserNotifications,
    getNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};