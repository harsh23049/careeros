import { Router } from "express";

import {
    createCoverLetter,
    getUserCoverLetters,
    getCoverLetter,
    getApplicationCoverLetters,
    updateCoverLetter,
    deleteCoverLetter,
} from "../controllers/coverLetter.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createCoverLetter);

router.get("/", getUserCoverLetters);

router.get(
    "/application/:applicationId",
    getApplicationCoverLetters
);

router.get("/:id", getCoverLetter);

router.patch("/:id", updateCoverLetter);

router.delete("/:id", deleteCoverLetter);

export default router;