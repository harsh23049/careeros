import { Router } from "express";

import {
    createNotification,
    getUserNotifications,
    getNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../controllers/notification.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createNotification);

router.get("/", getUserNotifications);

router.get("/:id", getNotification);

router.patch("/:id/read", markNotificationAsRead);

router.patch("/read-all", markAllNotificationsAsRead);

router.delete("/:id", deleteNotification);

export default router;