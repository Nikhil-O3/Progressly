import app from "./app.js"
import connectDB from "./config/db.js"
import "dotenv/config";


const port=process.env.PORT || 5000;


//connect db
connectDB();

//listen 
app.listen(port,()=>
{
    console.log(`server running on port ${port}`);
})