import express from "express"
import cors from "cors";//to handle development operation calls between node and react.
import userRouter from './routes/authentication.js';

const app = express();

app.use(express.json());
app.use(cors());

//handle requests
app.get("/",(req,res)=>
{
    return res.send("res").status(200);
})

app.use("/api/auth",userRouter);

export default app;