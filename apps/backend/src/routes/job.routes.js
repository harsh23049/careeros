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
import { matchResumeToJob} from "../controllers/resumeMatching.controller.js";


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
// Resume Matching
router.post(
    "/:jobId/match-resume/:resumeId",
    matchResumeToJob
);
// AI Cover Letter Generation
import {
    generateCoverLetter,
} from "../controllers/coverLetterAI.controller.js";


export default router;