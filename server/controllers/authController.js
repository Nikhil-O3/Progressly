import bcrypt from "bcryptjs"
import User from "../models/userSchema.js"
import jwt from "jsonwebtoken"

export const registerUser = async(req,res)=>
{
    const email=req.body.email;
    const password=req.body.password;
    const fullName=req.body.fullName;

    if(!email || !password || !fullName)
    {
        return res.sendStatus(400);
    }
    //check for duplicate email
    //check for strong password 
    const isUsed = await User.findOne({email:email});

    if(isUsed){
        return res.status(409).json({
            success: false,
            message: "Email already exists"
    });}

    try{

        const hashedpass= await bcrypt.hash(password,12);

        const newUser = await User.create({
        email,                                      //shorthand e:e to e since both are same words
        password : hashedpass,
        name : fullName

        
    })

    return res.sendStatus(201);
    //redirect to login

    }

    catch(err)
    {
        console.log(err);
        return res.sendStatus(500);
    }

    
}


export const loginUser = async(req,res)=>//check for already logged in

{//create token here and pass it 
    const email=req.body.email;
    const password=req.body.password;
   

    if(!email || !password)
    {
        return res.sendStatus(400);
    }
    

    try{
        const curruser=await User.findOne({email:email});
        if(!curruser)return res.status(401).json({
            success:false,
            error:"email not registered or incorrect gmail input"
        });

        const passMatch=await bcrypt.compare(password,curruser.password);

        if(!passMatch)return res.status(401).json(
            {
                success:false,
                error:"wrong password"
            }
        )

        return res.status(200).json({
            success:true,
            message:"login successfull"
        })

    }catch(e)
    {
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}


export const logoutUser = async(req,res)=>
{

}


export const userData = async(req,res)=>
{

}

