import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CareerOS Backend is Running 🚀",
    });
});

export default router;