import express from "express"
import {registerUser , loginUser , logoutUser  } from "../controllers/authController.js"
import { userData } from "../services/userServices.js"
import { authMiddleware } from '../middlewares/authmiddleware.js'


const router=express.Router();

router.post("/register",registerUser);

router.post("/login",loginUser);

router.post("/logout",logoutUser);

router.get("/me",authMiddleware,userData);

export default router;