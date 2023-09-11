
const express = require("express")
const router = new express.Router()
const userdb = require("../models/userSchema")
const  bcrypt = require("bcryptjs")
const authenticate = require("../middleware/authenticate")
const nodemailer  = require("nodemailer")
const jwt = require("jsonwebtoken")



const keysecret = "yashikaattherategmaildotcomtend"


// email config

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"yashikayeshi@gmail.com",
        pass:"mlqoeedhnuwewerm"
    }
})




// for registration
router.post("/register",async(req,res)=>{
    console.log(req.body)
    const{fname,email,password,cpassword} = req.body;

    if(!fname || !email || !password || !cpassword){
        res.status(422).json({error:"fill all the details"})
    }
    try{
        const preuser = await userdb.findOne({email:email})

        if(preuser)
        {
            res.status(422).json({error:"Email already exsists"})  
        }else if(password !== cpassword)
        {
            res.status(422).json({error:"Password and confirm password doesnot match"})  
        }
        else{
            const finalUser = new userdb({
                    fname,email,password,cpassword
            });

            // hashing

            const storeData = await finalUser.save();
           // console.log(storeData)

            res.status(201).json({status:201,storeData})
        }


    }catch(error)
    {
        res.status(422).json({error:"catch block"})  
    }

});

//user login

router.post("/login",async(req,res)=>{
    console.log(req.body)
    const{email,password} = req.body;

    if(!email || !password){
        res.status(422).json({error:"fill all the details"})
    }

    try{
        const userValid = await userdb.findOne({email:email})

        if(userValid){
            const isMatch = await bcrypt.compare(password,userValid.password)

            if(!isMatch)
            {
                
                res.status(422).json({error:"Invalid details"})
            }
            else{
                //token generate
                const token = await userValid.generateAuthtoken()

               // console.log(token)

            //cookie generate
            res.cookie("usercookie",token,{
                expires:new Date(Date.now()+9000000),
                httpOnly:true
            }); 
            const result = {
                userValid,
                token
            }
            res.status(201).json({status:201,result})

            }}else{
                res.status(401).json({status:401,message:"invalid details"});
            }

        }


    catch(error){
        res.status(401).json(error)
        console.log("catch block")
    }

});


//user valid

router.get("/validuser",authenticate,async(req,res)=>{
try{
    const ValidUserOne = await userdb.findOne({_id:req.userId});
    res.status(201).json({status:201,ValidUserOne})
}catch(error)
{
    res.status(401).json({status:401,error})
}

});

// user logout

router.get("/logout",authenticate,async(req,res)=>{
    try{
        req.rootUser.tokens = req.rootUser.tokens.filter((currelem)=>{
            return currelem.token !== req.token
        });
        res.clearCookie("usercookie",{path :"/"});

        req.rootUser.save();

        res.status(201).json({status:201})

    } catch(error)
    {  
        res.status(401).json({status:401,error})
    }
});
 
// send email link for reset password


router.post("/sendpasswordlink",async(req,res)=>{
    console.log(req.body)
    const{email} = req.body
    
    if(!email)
    {
        res.status(401).json({status:401,message:"Enter your Email"})
    }

    try{
        const userfind = await userdb.findOne({email:email});
      // console.log("userfind",userfind)

        // token generate for reset
        const token = jwt.sign({_id:userfind._id},keysecret,{
            expiresIn : "120s"
        });
      
        // console.log("token",token)
        const setusertoken =  await userdb.findByIdAndUpdate({_id:userfind._id},{verifytoken:token},{new:true});

        // console.log("setusertoken",setusertoken)

        if(setusertoken)
        {
            const mailOptions = {
                from :"yashikayeshi@gmail.com",
                to :email ,
                subject : "Sending Email for passowrd-reset",
                text:`This link is valid for 2mins http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`
            }
            transporter.sendMail(mailOptions,(error,info)=>{
                if(error)
                {
                    console.log("error",error)
                    res.status(401).json({status:401,message:"email not sent"})
                }
                else{
                    console.log("Email sent",info.response)
                    res.status(201).json({status:201,message:"Email sent successfully"})
                }
            })
        }
        
    }catch(error){
        res.status(401).json({status:401,message:"Invalid User"})
    }



});

// Verify user for forgot password time

router.get("/forgotpassword/:id/:token",async(req,res)=>{
    const {id,token} = req.params
    // console.log(id,token)
    try{
        const validuser = await userdb.findOne({_id:id,verifytoken:token})
        // console.log(validuser)
        const verifyToken = jwt.verify(token,keysecret);

        console.log(verifyToken)

        if(validuser && verifyToken._id)
        {
           
            res.status(201).json({status:201,validuser})

        }else{
            res.status(201).json({status:401,message:"user doesnot exsists"})
        }
    }

     catch(error){
        res.status(201).json({status:401,error})
    }
});

// change passowrd

router.post("/:id/:token",async(req,res)=>{
    const{id,token} = req.params;

    const {password} = req.body

    try{
        const validuser = await userdb.findOne({_id:id,verifytoken:token})
        // console.log(validuser)
        const verifyToken = jwt.verify(token,keysecret);

        if(validuser && verifyToken._id){
            const newpassword = await bcrypt.hash(password,12)
            const setnewuserpass = await userdb.findByIdAndUpdate({_id:id,password:newpassword})

            setnewuserpass.save();
            res.status(201).json({status:201,setnewuserpass})
        }else{
            res.status(401).json({status:401,message:"user doesnot exsists"})
        }

    }catch(error)
    {
        res.status(201).json({status:401,error})
    }
})






module.exports = router;