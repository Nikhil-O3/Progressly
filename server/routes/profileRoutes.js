import express from "express";
import { getPublicProfile } from "../controllers/metricController.js";

const router = express.Router();

// Public route - no auth needed
router.get("/:userId", getPublicProfile);

export default router;
