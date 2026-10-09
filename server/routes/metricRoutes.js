import express from "express";
import {
  getMetrics, createMetric, updateMetric, deleteMetric,
  getEntries, addEntry, updateEntry, deleteEntry, getStats, getPublicProfile
} from "../controllers/metricController.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const router = express.Router();

// protected routes
router.get("/", authMiddleware, getMetrics);
router.post("/", authMiddleware, createMetric);
router.put("/:id", authMiddleware, updateMetric);
router.delete("/:id", authMiddleware, deleteMetric);
router.get("/:id/entries", authMiddleware, getEntries);
router.post("/:id/entries", authMiddleware, addEntry);
router.put("/:id/entries/:entryId", authMiddleware, updateEntry);
router.delete("/:id/entries/:entryId", authMiddleware, deleteEntry);
router.get("/:id/stats", authMiddleware, getStats);

export default router;
