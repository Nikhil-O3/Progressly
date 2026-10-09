import express from "express";
import { searchUsers, followUser, unfollowUser, followStatus, getFeed } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.get("/search", authMiddleware, searchUsers);
router.get("/feed", authMiddleware, getFeed);
router.post("/:id/follow", authMiddleware, followUser);
router.delete("/:id/follow", authMiddleware, unfollowUser);
router.get("/:id/follow-status", authMiddleware, followStatus);

export default router;
