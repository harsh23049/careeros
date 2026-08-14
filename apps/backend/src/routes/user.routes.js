import { Router } from "express";
import { registerUser , loginUser, logOutUser, me, updateUserInfo, refreshAccessToken} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logOutUser);
router.get("/profile", authMiddleware, me);
router.post("/refresh-access-token", authMiddleware, refreshAccessToken);
router.patch("/updateInfo", authMiddleware, updateUserInfo);

export default router;