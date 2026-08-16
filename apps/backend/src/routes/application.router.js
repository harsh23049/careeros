import { Router } from "express";

import {
    createApplication,
    getUserApplications,
    getApplication,
    updateApplication,
    deleteApplication,
} from "../controllers/application.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createApplication);

router.get("/", getUserApplications);

router.get("/:id", getApplication);

router.patch("/:id", updateApplication);

router.delete("/:id", deleteApplication);

export default router;