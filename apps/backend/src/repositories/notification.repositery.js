import Notification from "../models/notification.model.js";

class NotificationRepository {
    // Create a notification
    async create(notificationData) {
        return await Notification.create(notificationData);
    }

    // Find a notification by ID
    async findById(notificationId) {
        return await Notification.findById(notificationId);
    }

    // Find a notification belonging to a user
    async findByIdAndUser(notificationId, userId) {
        return await Notification.findOne({
            _id: notificationId,
            user: userId,
        });
    }

    // Find all notifications of a user
    async findByUser(userId) {
        return await Notification.find({
            user: userId,
        }).sort({
            createdAt: -1,
        });
    }

    // Find unread notifications of a user
    async findUnreadByUser(userId) {
        return await Notification.find({
            user: userId,
            read: false,
        }).sort({
            createdAt: -1,
        });
    }

    // Mark a notification as read
    async markAsRead(notificationId) {
        return await Notification.findByIdAndUpdate(
            notificationId,
            {
                read: true,
                readAt: new Date(),
            },
            {
                new: true,
            }
        );
    }

    // Mark all notifications of a user as read
    async markAllAsRead(userId) {
        return await Notification.updateMany(
            {
                user: userId,
                read: false,
            },
            {
                $set: {
                    read: true,
                    readAt: new Date(),
                },
            }
        );
    }

    // Delete a notification
    async deleteById(notificationId) {
        return await Notification.findByIdAndDelete(
            notificationId
        );
    }

    // Delete all notifications of a user
    async deleteByUserId(userId) {
        return await Notification.deleteMany({
            user: userId,
        });
    }
}

export default new NotificationRepository();