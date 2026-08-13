import { Router } from "express";
import { registerUser , loginUser, logOutUser, me, updateUserInfo} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logOutUser);
router.get("/profile", authMiddleware, me);
router.patch("/updateInfo", authMiddleware, updateUserInfo);

export default router;