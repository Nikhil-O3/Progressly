import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import metricRouter from './routes/metricRoutes.js';
import profileRouter from './routes/profileRoutes.js';
import userSocialRouter from './routes/userSocialRoutes.js';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.json({ message: "Progressly API running" }));

app.use("/api/auth", authRouter);
app.use("/api/me", userRouter);
app.use("/api/metrics", metricRouter);
app.use("/api/profile", profileRouter);
app.use("/api/users", userSocialRouter);

export default app;