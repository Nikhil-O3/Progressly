import express from "express"
import { userData } from "../services/userServices.js"
import { authMiddleware } from '../middlewares/authmiddleware.js'


const router=express.Router();

router.get("/profile",authMiddleware,userData);

export default router;