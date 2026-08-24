import { Router } from "express";

import {
    createAIHistory,
    getUserAIHistory,
    getAIHistory,
    getApplicationAIHistory,
    getJobAIHistory,
    getAIHistoryByType,
    updateAIHistory,
    deleteAIHistory,
} from "../controllers/aiHistory.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// Create
router.post("/", createAIHistory);

// Get all
router.get("/", getUserAIHistory);

// Get by application
router.get(
    "/application/:applicationId",
    getApplicationAIHistory
);

// Get by job
router.get(
    "/job/:jobId",
    getJobAIHistory
);

// Get by type
router.get(
    "/type/:type",
    getAIHistoryByType
);

// Get single
router.get("/:id", getAIHistory);

// Update
router.patch("/:id", updateAIHistory);

// Delete
router.delete("/:id", deleteAIHistory);

export default router;