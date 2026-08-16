import { Router } from "express";

import {
    createResume,
    getUserResumes,
    getResume,
    getDefaultResume,
    updateResume,
    deleteResume,
} from "../controllers/resume.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createResume);

router.get("/", getUserResumes);

router.get("/default", getDefaultResume);

router.get("/:id", getResume);

router.patch("/:id", updateResume);

router.delete("/:id", deleteResume);

export default router;
