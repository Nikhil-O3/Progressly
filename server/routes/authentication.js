import express from "express"

const router=express.Router();

router.post("register",registerUser);

router.post("login",loginUser);

router.post("logout",logoutUser);

router.get("me",userData);

export default router;