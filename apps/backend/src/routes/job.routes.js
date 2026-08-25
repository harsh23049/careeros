import { Router } from "express";

import {
    createJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob,
} from "../controllers/job.controller.js";

import {
    analyzeJob,
} from "../controllers/jobAnalysis.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// Job CRUD
router.post("/", createJob);

router.get("/", getJobs);

router.get("/:id", getJob);

router.patch("/:id", updateJob);

router.delete("/:id", deleteJob);

// AI Job Analysis
router.post(
    "/:jobId/analyze",
    analyzeJob
);

export default router;