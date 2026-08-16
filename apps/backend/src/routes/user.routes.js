import { Router } from "express";
import { registerUser , loginUser, logOutUser, me, updateUserInfo, refreshAccessToken, changePassword, updateAvatar, deleteAccount} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logOutUser);
router.get("/profile", authMiddleware, me);
router.post("/refresh-access-token", refreshAccessToken);
router.patch("/updateInfo", authMiddleware, updateUserInfo);
router.patch("/changePassword", authMiddleware, changePassword);
router.patch("/update-avatar", authMiddleware, upload.single("avatar"), updateAvatar);
router.delete("/delete-account", authMiddleware, deleteAccount);

export default router;