import express from "express"
import cors from "cors";//to handle development operation calls between node and react.
import userRouter from './routes/authRoutes.js';
const app = express();
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cors());
app.use(cookieParser());


//handle requests
app.get("/",(req,res)=>
{
    return res.send("server replied {Result}").status(200);
})

app.use("/api/auth",userRouter);

export default app;