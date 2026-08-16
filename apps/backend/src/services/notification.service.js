import notificationRepository from "../repositories/notification.repository.js";
import ApiError from "../utils/ApiError.js";

// Create a notification
const createNotification = async (
    userId,
    {
        type,
        title,
        message,
        relatedApplication,
        relatedInterview,
    }
) => {
    return await notificationRepository.create({
        user: userId,
        type,
        title,
        message,
        relatedApplication,
        relatedInterview,
    });
};

// Get all notifications of a user
const getUserNotifications = async (
    userId,
    unreadOnly = false
) => {
    if (unreadOnly) {
        return await notificationRepository.findUnreadByUser(
            userId
        );
    }

    return await notificationRepository.findByUser(
        userId
    );
};

// Get one notification
const getNotification = async (
    notificationId,
    userId
) => {
    const notification =
        await notificationRepository.findByIdAndUser(
            notificationId,
            userId
        );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    return notification;
};

// Mark one notification as read
const markNotificationAsRead = async (
    notificationId,
    userId
) => {
    const notification =
        await notificationRepository.findByIdAndUser(
            notificationId,
            userId
        );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    if (notification.read) {
        return notification;
    }

    return await notificationRepository.markAsRead(
        notificationId
    );
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (userId) => {
    await notificationRepository.markAllAsRead(
        userId
    );

    return true;
};

// Delete a notification
const deleteNotification = async (
    notificationId,
    userId
) => {
    const notification =
        await notificationRepository.findByIdAndUser(
            notificationId,
            userId
        );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    await notificationRepository.deleteById(
        notificationId
    );

    return true;
};

export {
    createNotification,
    getUserNotifications,
    getNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};